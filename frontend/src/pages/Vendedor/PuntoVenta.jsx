import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Keypad from '../../components/ui/Keypad';
import Modal from '../../components/ui/Modal';
import { ShoppingCart, Banknote, CreditCard, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const PuntoVenta = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [kilosInput, setKilosInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };
  const closeModal = () => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => {
        console.error(err);
        setError('Error cargando productos. ¿Está el backend encendido?');
      });
  }, []);

  const totalCarrito = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || !kilosInput) return;
    const kilos = parseFloat(kilosInput);
    if (isNaN(kilos) || kilos <= 0) return;

    const subtotal = kilos * productoSeleccionado.precio_kilo;
    
    setCarrito([...carrito, {
      ...productoSeleccionado,
      kilos,
      subtotal,
      cartId: Date.now()
    }]);

    setProductoSeleccionado(null);
    setKilosInput('');
  };

  const eliminarDelCarrito = (cartId) => {
    setCarrito(carrito.filter(item => item.cartId !== cartId));
  };

  const procesarVenta = async (metodoPago) => {
    if (carrito.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_pago: metodoPago,
          productos: carrito.map(item => ({
            producto_id: item.id,
            kilos: item.kilos,
            subtotal: item.subtotal
          }))
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      showModal('alert', 'Venta Exitosa', `Venta en ${metodoPago} procesada. ${data.estado === 'Pendiente' ? 'Queda pendiente de confirmación en la caja.' : ''}`);
      setCarrito([]);
      setCartOpen(false);
    } catch (err) {
      showModal('alert', 'Error al procesar venta', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-meat-dark">
      <Modal {...modal} onClose={closeModal} />
      {/* Panel Izquierdo/Principal: Productos y Teclado */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-24 md:pb-4 md:w-3/5 lg:w-2/3">
        {error && <div className="bg-meat-red text-white p-3 rounded-lg shadow-md">{error}</div>}
        
        {/* Filtro de Categorías */}
        {productos && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
            {['Todos', ...new Set(['Vaca', 'Pollo', 'Cerdo', ...productos.map(p => p.categoria)])].map(cat => (
              <Button
                key={cat}
                variant={filtroCategoria === cat ? 'primary' : 'neutral'}
                className="py-2 px-4 whitespace-nowrap rounded-full text-sm"
                onClick={() => setFiltroCategoria(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        {/* Grilla de Productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(filtroCategoria === 'Todos' ? productos : productos.filter(p => p.categoria === filtroCategoria)).map(p => (
            <Button
              key={p.id}
              variant={productoSeleccionado?.id === p.id ? 'primary' : 'neutral'}
              className={`flex flex-col items-center justify-center py-3 px-1 h-auto min-h-[6.5rem] border ${productoSeleccionado?.id === p.id ? 'border-meat-green shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-gray-700'}`}
              onClick={() => {
                setProductoSeleccionado(p);
                setKilosInput('');
              }}
            >
              <span className="font-bold text-center line-clamp-2 leading-tight px-1">{p.nombre}</span>
              <span className="text-sm font-normal opacity-80 mt-1">{formatCurrency(p.precio_kilo)}/kg</span>
            </Button>
          ))}
          {productos.length === 0 && !error && (
            <p className="text-gray-400 col-span-full">Cargando productos...</p>
          )}
        </div>

        {/* Teclado en formato Modal (Overlay) para mejor UX en móviles */}
        {productoSeleccionado && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4">
            <div className="bg-meat-gray border-t sm:border border-gray-700 p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md animate-fade-in-up pb-8 sm:pb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Ingrese kilos para:</h3>
                  <h2 className="text-2xl text-meat-green font-bold truncate pr-2">{productoSeleccionado.nombre}</h2>
                </div>
                <button onClick={() => setProductoSeleccionado(null)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center transition shrink-0">
                  <span className="text-xl font-bold leading-none">&times;</span>
                </button>
              </div>
              <Keypad 
                value={kilosInput} 
                onChange={setKilosInput} 
                onEnter={agregarAlCarrito} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 z-40">
        <Button 
          variant={carrito.length > 0 ? 'primary' : 'neutral'}
          className={`w-full flex justify-between items-center shadow-xl ${carrito.length > 0 ? 'animate-bounce-slight' : ''}`}
          onClick={() => setCartOpen(!cartOpen)}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} />
            <span>Ticket ({carrito.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{formatCurrency(totalCarrito)}</span>
            {cartOpen ? <ChevronDown /> : <ChevronUp />}
          </div>
        </Button>
      </div>

      {/* Backdrop for mobile cart */}
      {cartOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Panel Derecho / Bottom Sheet: Carrito */}
      <div className={`
        fixed md:static inset-x-0 bottom-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${cartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        md:w-2/5 lg:w-1/3 bg-meat-gray md:border-l border-t md:border-t-0 border-gray-700 
        flex flex-col h-[85vh] md:h-full rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none
        absolute md:relative right-0
      `}>
        {/* Handle for mobile con Gestos Táctiles */}
        <div 
          className="md:hidden w-full flex justify-center py-4 cursor-pointer active:bg-gray-800/50" 
          onClick={() => setCartOpen(false)}
          onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
          onTouchEnd={(e) => {
            const touchEndY = e.changedTouches[0].clientY;
            if (touchEndY - touchStartY > 50) {
              setCartOpen(false); // Si desliza más de 50px hacia abajo, cerrar
            }
          }}
        >
          <div className="w-16 h-1.5 bg-gray-500 rounded-full"></div>
        </div>

        <div className="p-4 flex-1 flex flex-col h-full overflow-hidden">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-white">
            <ShoppingCart className="text-meat-green" /> Ticket Actual
          </h2>
          
          <div className="flex-1 overflow-y-auto mb-4 bg-black/30 rounded-xl p-2 border border-gray-800">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                <ShoppingCart size={48} className="opacity-20" />
                <p>El ticket está vacío</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {carrito.map(item => (
                  <li key={item.cartId} className="flex justify-between items-center bg-meat-gray p-3 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <p className="font-bold text-white">{item.nombre}</p>
                      <p className="text-sm text-gray-400">{item.kilos} kg x {formatCurrency(item.precio_kilo)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-meat-green text-lg">{formatCurrency(item.subtotal)}</span>
                      <button 
                        onClick={() => eliminarDelCarrito(item.cartId)}
                        className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-black/40 p-4 rounded-xl border border-gray-700 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-gray-400">Total:</span>
              <span className="text-4xl font-bold text-white">{formatCurrency(totalCarrito)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="primary" 
                onClick={() => procesarVenta('Efectivo')}
                disabled={carrito.length === 0 || loading}
                className="flex flex-col items-center gap-1"
              >
                <Banknote size={24} />
                <span>Efectivo</span>
              </Button>
              <Button 
                variant="blue" 
                onClick={() => procesarVenta('Transferencia')}
                disabled={carrito.length === 0 || loading}
                className="flex flex-col items-center gap-1"
              >
                <CreditCard size={24} />
                <span>Transf.</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuntoVenta;
