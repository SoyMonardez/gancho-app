import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const Confirmaciones = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const fetchVentas = () => {
    fetch('/api/ventas/pendientes')
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchVentas();
    const interval = setInterval(fetchVentas, 10000); // Polling cada 10s
    return () => clearInterval(interval);
  }, []);

  const confirmarVenta = (id) => {
    showModal('confirm', 'Confirmar Transferencia', '¿Verificaste que el dinero ingresó a la cuenta?', async () => {
      closeModal();
      setLoading(true);
    try {
      const response = await fetch(`/api/ventas/${id}/confirmar`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Error al confirmar');
        showModal('alert', 'Éxito', 'Transferencia confirmada');
        fetchVentas(); // Recargar lista
      } catch (err) {
        showModal('alert', 'Error', err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto h-full flex flex-col">
      <Modal {...modal} onClose={closeModal} />
      <h2 className="text-2xl font-bold mb-6 text-meat-light">Ventas por Transferencia</h2>
      
      {ventas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <CheckCircle size={64} className="mb-4 text-gray-700" />
          <p className="text-xl">No hay transferencias pendientes</p>
        </div>
      ) : (
        <div className="grid gap-4 overflow-y-auto pb-20">
          {ventas.map(v => (
            <div key={v.id} className="bg-meat-gray p-5 rounded-xl border border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={20} className="text-yellow-500" />
                  <span className="font-bold text-gray-300">
                    {new Date(v.fecha).toLocaleTimeString()}
                  </span>
                  <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-sm">
                    Pendiente
                  </span>
                </div>
                <p className="text-gray-400 text-sm">ID Venta: #{v.id}</p>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(v.total)}
                </div>
                <Button 
                  variant="primary" 
                  className="min-w-[140px]"
                  onClick={() => confirmarVenta(v.id)}
                  disabled={loading}
                >
                  <CheckCircle className="mr-2" /> Confirmar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Confirmaciones;
