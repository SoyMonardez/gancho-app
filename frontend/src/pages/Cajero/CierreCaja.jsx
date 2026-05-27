import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Keypad from '../../components/ui/Keypad';
import Modal from '../../components/ui/Modal';
import { Wallet, Info, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CierreCaja = () => {
  const [montoFisico, setMontoFisico] = useState('');
  const [resultado, setResultado] = useState(null);
  const [resumenDia, setResumenDia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };
  const closeModal = () => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    fetch('/api/caja/resumen-dia')
      .then(res => res.json())
      .then(data => setResumenDia(data))
      .catch(console.error);
  }, [resultado]); // Recargar resumen si se hace un cierre

  const handleCierre = () => {
    if (!montoFisico) return;
    showModal('confirm', 'Confirmar Cierre', '¿Estás seguro de registrar este monto para el cierre ciego?', async () => {
      closeModal();
      setLoading(true);
    try {
      const response = await fetch('/api/caja/cierre-ciego', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto_fisico_empleado: parseFloat(montoFisico) })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

        setResultado(data);
      } catch (err) {
        showModal('alert', 'Error', err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto h-full flex flex-col gap-6 overflow-y-auto pb-20">
      <Modal {...modal} onClose={closeModal} />
      <h2 className="text-2xl font-bold text-meat-light flex items-center gap-2">
        <Wallet /> Gestión de Caja
      </h2>

      {/* Panel de Resumen del Día */}
      {resumenDia && (
        <div className="bg-meat-gray p-5 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
            <TrendingUp size={20} className="text-meat-green" /> Resumen de Ventas (Hoy)
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
              <span className="text-xs text-gray-500 flex items-center gap-1 mb-1"><DollarSign size={14}/> Efectivo</span>
              <p className="text-lg font-bold text-meat-green">{formatCurrency(resumenDia.total_efectivo)}</p>
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
              <span className="text-xs text-gray-500 flex items-center gap-1 mb-1"><CreditCard size={14}/> Transferencia</span>
              <p className="text-lg font-bold text-blue-400">{formatCurrency(resumenDia.total_transferencia)}</p>
            </div>
          </div>
          <div className="bg-black/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
            <span className="text-gray-400 font-medium">Total General:</span>
            <span className="text-xl font-bold text-white">{formatCurrency(resumenDia.total_general)}</span>
          </div>
        </div>
      )}

      {/* Formulario de Cierre Ciego */}
      {!resultado ? (
        <div className="bg-meat-gray p-5 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-300">Cierre Ciego</h3>
          <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg flex items-start gap-3 mb-4">
            <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-200">
              Ingresa el efectivo físico que hay en la caja. El sistema calculará la diferencia automáticamente basándose en las ventas en efectivo del día.
            </p>
          </div>

          <div className="mb-4">
            <Keypad 
              value={montoFisico} 
              onChange={setMontoFisico} 
              onEnter={handleCierre} 
            />
          </div>
          
          <Button 
            variant="primary" 
            onClick={handleCierre}
            disabled={!montoFisico || loading}
            className="w-full mt-2"
          >
            Registrar Cierre
          </Button>
        </div>
      ) : (
        <div className="bg-meat-gray p-6 rounded-xl border border-gray-700 animate-fade-in-up shadow-md">
          <h3 className="text-xl font-bold text-center mb-6">Resultado del Cierre</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Declarado por ti:</span>
              <span className="font-bold">{formatCurrency(resultado.monto_fisico)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Total en Sistema (Efectivo):</span>
              <span className="font-bold">{formatCurrency(resultado.monto_sistema)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-gray-400">Diferencia:</span>
              <span className={`text-2xl font-bold ${resultado.diferencia === 0 ? 'text-meat-green' : (resultado.diferencia < 0 ? 'text-meat-red' : 'text-blue-400')}`}>
                {resultado.diferencia < 0 ? '-' : ''}{formatCurrency(Math.abs(resultado.diferencia))}
              </span>
            </div>
          </div>

          {resultado.diferencia === 0 && (
            <div className="text-center text-meat-green bg-green-900/20 p-3 rounded-lg mb-4">
              ¡Caja cuadrada perfectamente!
            </div>
          )}
          {resultado.diferencia < 0 && (
            <div className="text-center text-meat-red bg-red-900/20 p-3 rounded-lg mb-4">
              Falta dinero en la caja.
            </div>
          )}
          {resultado.diferencia > 0 && (
            <div className="text-center text-blue-400 bg-blue-900/20 p-3 rounded-lg mb-4">
              Sobra dinero en la caja.
            </div>
          )}

          <Button 
            variant="neutral" 
            className="w-full"
            onClick={() => {
              setResultado(null);
              setMontoFisico('');
            }}
          >
            Realizar otro cierre
          </Button>
        </div>
      )}
    </div>
  );
};

export default CierreCaja;
