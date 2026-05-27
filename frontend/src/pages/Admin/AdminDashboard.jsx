import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Keypad from '../../components/ui/Keypad';
import Modal from '../../components/ui/Modal';
import { Settings, TrendingUp, History, AlertTriangle, Trash2, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import CatalogoCRUD from './CatalogoCRUD';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('graficas'); // graficas, historial, aumentos
  
  // Data states
  const [estadisticas, setEstadisticas] = useState([]);
  const [historial, setHistorial] = useState([]);
  
  // Aumentos state
  const [categoria, setCategoria] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  const categorias = ['Vaca', 'Pollo', 'Cerdo'];

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const fetchData = () => {
    fetch('/api/estadisticas/grafica')
      .then(res => res.json())
      .then(data => {
        // Format date for chart
        const formatted = data.map(d => ({
          ...d,
          fecha_corta: new Date(d.dia).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          Total: Number(d.total_dia)
        }));
        setEstadisticas(formatted);
      }).catch(console.error);

    fetch('/api/ventas/historial')
      .then(res => res.json())
      .then(data => setHistorial(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAumento = async () => {
    if (!categoria || !porcentaje) return;
    
    showModal('confirm', 'Confirmar Aumento', `¿Aumentar ${porcentaje}% a todos los productos de la categoría ${categoria}?`, async () => {
      setLoading(true);
      closeModal();
      try {
        const response = await fetch('/api/productos/aumento-masivo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoria, porcentaje: parseFloat(porcentaje) })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        showModal('alert', '¡Éxito!', `${data.message}. (Productos afectados: ${data.afectadas})`);
        setCategoria('');
        setPorcentaje('');
      } catch (err) {
        showModal('alert', 'Error', err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCerrarDia = () => {
    showModal('confirm', 'Cerrar el Día', '¿Estás seguro de limpiar las ventas de hoy? Esto las archivará y la caja volverá a $0.00. Solo hazlo al finalizar la jornada.', async () => {
      closeModal();
      setLoading(true);
      try {
        const response = await fetch('/api/ventas/archivar-dia', { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        showModal('alert', 'Día Cerrado', data.message);
        fetchData();
      } catch (err) {
        showModal('alert', 'Error', err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-meat-dark">
      <Modal {...modal} onClose={closeModal} />

      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-meat-gray shrink-0">
        <button 
          className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition-colors ${activeTab === 'graficas' ? 'border-meat-green text-meat-green' : 'border-transparent text-gray-400'}`}
          onClick={() => setActiveTab('graficas')}
        >
          <TrendingUp size={20} /> <span className="text-xs font-bold">Rendimiento</span>
        </button>
        <button 
          className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition-colors ${activeTab === 'historial' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'}`}
          onClick={() => setActiveTab('historial')}
        >
          <History size={20} /> <span className="text-xs font-bold">Historial</span>
        </button>
        <button 
          className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition-colors ${activeTab === 'aumentos' ? 'border-purple-500 text-purple-500' : 'border-transparent text-gray-400'}`}
          onClick={() => setActiveTab('aumentos')}
        >
          <Settings size={20} /> <span className="text-xs font-bold">Aumentos</span>
        </button>
        <button 
          className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition-colors ${activeTab === 'catalogo' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
          onClick={() => setActiveTab('catalogo')}
        >
          <List size={20} /> <span className="text-xs font-bold">Catálogo</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {/* Tab Gráficas */}
        {activeTab === 'graficas' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-white">Ventas por Día (Últimos 30 días)</h2>
            <div className="bg-meat-gray p-4 rounded-xl border border-gray-700 h-80 mb-6">
              {estadisticas.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={estadisticas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" vertical={false} />
                    <XAxis dataKey="fecha_corta" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #4b5563', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="Total" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No hay suficientes datos para graficar.
                </div>
              )}
            </div>

            <div className="bg-red-900/20 border border-red-900 p-4 rounded-xl">
              <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                <AlertTriangle size={20} /> Acciones Peligrosas
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Si ya hiciste el cierre de caja y deseas resetear el resumen de hoy a $0.00 para empezar un nuevo turno, usa este botón. Las ventas se archivarán en el historial.
              </p>
              <Button variant="danger" className="w-full flex justify-center gap-2" onClick={handleCerrarDia} disabled={loading}>
                <Trash2 /> Limpiar Día (Archivar Ventas)
              </Button>
            </div>
          </div>
        )}

        {/* Tab Historial */}
        {activeTab === 'historial' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-white">Historial de Ventas</h2>
            <div className="bg-meat-gray rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-black/50">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Pago</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map(v => (
                      <tr key={v.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="px-4 py-3">#{v.id}</td>
                        <td className="px-4 py-3">{new Date(v.fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="px-4 py-3 font-bold text-white">{formatCurrency(v.total)}</td>
                        <td className="px-4 py-3">{v.metodo_pago}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            v.estado === 'Confirmada' ? 'bg-green-900/30 text-meat-green' : 'bg-yellow-900/30 text-yellow-500'
                          }`}>
                            {v.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {historial.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No hay ventas registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Aumentos */}
        {activeTab === 'aumentos' && (
          <div className="animate-fade-in max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-6 text-white text-center">Aumento Masivo de Precios</h2>
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-gray-400 mb-2 font-bold">1. Seleccionar Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {categorias.map(cat => (
                    <Button
                      key={cat}
                      variant={categoria === cat ? 'primary' : 'neutral'}
                      size="normal"
                      onClick={() => setCategoria(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 font-bold">2. Porcentaje de Aumento (%)</label>
                <Keypad 
                  value={porcentaje} 
                  onChange={setPorcentaje} 
                  onEnter={handleAumento} 
                />
              </div>

              <Button 
                variant="primary" 
                onClick={handleAumento}
                disabled={!categoria || !porcentaje || loading}
                className="w-full mt-4"
              >
                <Settings className="mr-2" /> Aplicar Aumento
              </Button>
            </div>
          </div>
        )}

        {/* Tab Catálogo */}
        {activeTab === 'catalogo' && (
          <CatalogoCRUD showModal={showModal} />
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
