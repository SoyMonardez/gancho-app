import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CatalogoCRUD = ({ showModal }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Edit/Create state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Vaca');
  const [precio, setPrecio] = useState('');

  const categorias = ['Vaca', 'Pollo', 'Cerdo'];

  const fetchProductos = () => {
    setLoading(true);
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setNombre('');
    setCategoria('Vaca');
    setPrecio('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !precio) return;
    
    setLoading(true);
    const url = isEditing ? `/api/productos/${currentId}` : '/api/productos';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, categoria, precio_kilo: parseFloat(precio) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      showModal('alert', 'Éxito', data.message || 'Producto guardado');
      resetForm();
      fetchProductos();
    } catch (error) {
      showModal('alert', 'Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prod) => {
    setIsEditing(true);
    setCurrentId(prod.id);
    setNombre(prod.nombre);
    setCategoria(prod.categoria);
    setPrecio(prod.precio_kilo.toString());

    // Scroll to the form so the user sees it on mobile
    const formElement = document.getElementById('catalogo-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDelete = (prod) => {
    showModal('confirm', 'Eliminar Producto', `¿Estás seguro de eliminar "${prod.nombre}"? Esto lo ocultará del sistema pero mantendrá el historial intacto.`, async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/productos/${prod.id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        showModal('alert', 'Eliminado', data.message);
        fetchProductos();
      } catch (error) {
        showModal('alert', 'Error', error.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Formulario (Izquierda) */}
      <div id="catalogo-form" className="w-full md:w-1/3 bg-meat-gray border border-gray-700 p-4 rounded-xl h-fit">
        <h3 className="text-xl font-bold text-white mb-4">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Nombre</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              required
              className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-meat-green focus:outline-none"
              placeholder="Ej. Tira de Asado"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Categoría</label>
            <select 
              value={categoria} 
              onChange={e => setCategoria(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-meat-green focus:outline-none"
            >
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Precio por kg ($)</label>
            <input 
              type="number" 
              step="0.01"
              value={precio} 
              onChange={e => setPrecio(e.target.value)} 
              required
              className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-meat-green focus:outline-none"
              placeholder="Ej. 8500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {isEditing ? 'Actualizar' : <><Plus size={18} className="inline mr-1"/> Añadir</>}
            </Button>
            {isEditing && (
              <Button type="button" variant="neutral" onClick={resetForm} disabled={loading}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Lista (Derecha) */}
      <div className="w-full md:w-2/3 bg-meat-gray border border-gray-700 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-white">Catálogo Activo</h3>
          <button onClick={fetchProductos} className="text-gray-400 hover:text-white" disabled={loading}>
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-black/50">
              <tr>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Precio/kg</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.categoria === 'Vaca' ? 'bg-red-900/30 text-red-400' :
                      p.categoria === 'Pollo' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-pink-900/30 text-pink-400'
                    }`}>
                      {p.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                  <td className="px-4 py-3 text-meat-green font-bold">{formatCurrency(p.precio_kilo)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded mr-2" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded" title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No hay productos en el catálogo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CatalogoCRUD;
