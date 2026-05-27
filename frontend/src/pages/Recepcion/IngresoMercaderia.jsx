import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Keypad from '../../components/ui/Keypad';
import { Truck, Calculator, DollarSign, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const IngresoMercaderia = () => {
  const [categoria, setCategoria] = useState('Vaca');
  const [unidades, setUnidades] = useState('');
  const [pesoTotal, setPesoTotal] = useState('');
  const [porcentajeDesperdicio, setPorcentajeDesperdicio] = useState('25');
  const [costoKgBruto, setCostoKgBruto] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  const [activeInput, setActiveInput] = useState('unidades');
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);

  const categorias = ['Vaca', 'Pollo', 'Cerdo'];

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const handleInput = (val) => {
    if (activeInput === 'unidades') setUnidades(val);
    else if (activeInput === 'pesoTotal') setPesoTotal(val);
    else if (activeInput === 'desperdicio') setPorcentajeDesperdicio(val);
    else if (activeInput === 'costoKgBruto') setCostoKgBruto(val);
  };

  const getInputValue = () => {
    if (activeInput === 'unidades') return unidades;
    if (activeInput === 'pesoTotal') return pesoTotal;
    if (activeInput === 'desperdicio') return porcentajeDesperdicio;
    if (activeInput === 'costoKgBruto') return costoKgBruto;
    return '';
  };

  const handleInputClick = (inputName) => {
    setActiveInput(inputName);
    setIsKeypadOpen(true);
  };

  const procesarIngreso = async () => {
    if (!unidades || !pesoTotal || !porcentajeDesperdicio || !costoKgBruto) {
      showModal('alert', 'Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/mercaderia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria,
          unidades: parseInt(unidades),
          peso_total: parseFloat(pesoTotal),
          porcentaje_desperdicio: parseFloat(porcentajeDesperdicio),
          costo_kg_bruto: parseFloat(costoKgBruto)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      showModal('alert', 'Resultados de Inversión y Rendimiento', (
        <div className="mt-4 text-left space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Inversión Total:</span>
            <span className="text-xl font-bold text-white">{formatCurrency(data.inversion_total)}</span>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Peso Neto:</span>
            <span className="text-xl font-bold text-white">{data.peso_neto.toFixed(2)} kg</span>
          </div>

          <div className="bg-blue-900/40 p-4 rounded-xl border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <p className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-1">Tu costo real por kilo limpio:</p>
            <p className="text-4xl font-black text-blue-400">{formatCurrency(data.costo_real_kilo)}</p>
          </div>

          <div className="bg-meat-green/10 p-3 rounded-lg border border-meat-green/50 flex flex-col gap-1">
            <span className="text-meat-green text-xs font-bold uppercase">Proyección Venta Promedio:</span>
            <span className="text-xl font-bold text-meat-green">{formatCurrency(data.proyeccion)} <span className="text-sm font-normal">({formatCurrency(data.precio_promedio)}/kg)</span></span>
          </div>
        </div>
      ), () => {
        setUnidades('');
        setPesoTotal('');
        setPorcentajeDesperdicio('25');
        setCostoKgBruto('');
        closeModal();
      });

    } catch (err) {
      showModal('alert', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-meat-dark relative">
      <Modal {...modal} onClose={closeModal} />
      
      <div className="flex-1 p-4 overflow-y-auto pb-24 md:pb-4 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Truck className="text-meat-green" /> Ingreso de Mercadería
        </h2>

        <div className="space-y-6">
          {/* Categoría */}
          <div>
            <label className="block text-gray-400 mb-2 font-bold">1. Tipo de Mercadería</label>
            <div className="grid grid-cols-3 gap-2">
              {categorias.map(cat => (
                <Button
                  key={cat}
                  variant={categoria === cat ? 'primary' : 'neutral'}
                  onClick={() => setCategoria(cat)}
                  className="py-3"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Inputs de carga */}
          <div>
             <label className="block text-gray-400 mb-2 font-bold">2. Detalles del Ingreso</label>
            <div className="bg-meat-gray border border-gray-700 p-4 rounded-2xl grid grid-cols-2 gap-4">
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${activeInput === 'unidades' ? 'border-meat-green bg-meat-green/10' : 'border-gray-700 bg-gray-800'}`}
                onClick={() => handleInputClick('unidades')}
              >
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Unidades</p>
                <p className={`text-2xl font-bold ${unidades ? 'text-white' : 'text-gray-600'}`}>{unidades || '0'}</p>
              </div>
              
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${activeInput === 'pesoTotal' ? 'border-meat-green bg-meat-green/10' : 'border-gray-700 bg-gray-800'}`}
                onClick={() => handleInputClick('pesoTotal')}
              >
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Peso Bruto</p>
                <p className={`text-2xl font-bold ${pesoTotal ? 'text-white' : 'text-gray-600'}`}>{pesoTotal || '0'} <span className="text-lg">kg</span></p>
              </div>

              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${activeInput === 'desperdicio' ? 'border-meat-green bg-meat-green/10' : 'border-gray-700 bg-gray-800'}`}
                onClick={() => handleInputClick('desperdicio')}
              >
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">% Desperdicio</p>
                <p className={`text-2xl font-bold ${porcentajeDesperdicio ? 'text-white' : 'text-gray-600'}`}>{porcentajeDesperdicio || '0'}%</p>
              </div>

              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${activeInput === 'costoKgBruto' ? 'border-meat-green bg-meat-green/10' : 'border-gray-700 bg-gray-800'}`}
                onClick={() => handleInputClick('costoKgBruto')}
              >
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Costo/Kg Bruto</p>
                <p className={`text-2xl font-bold ${costoKgBruto ? 'text-white' : 'text-gray-600'}`}>$ {costoKgBruto || '0'}</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
             <Button variant="primary" className="w-full py-4 text-lg font-bold flex justify-center items-center gap-2" onClick={procesarIngreso} disabled={loading}>
               <Calculator size={24} /> Calcular Rendimiento
             </Button>
          </div>

        </div>
      </div>

      {/* Teclado Overlay Modal */}
      {isKeypadOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4 animate-fade-in">
          <div className="bg-meat-gray border-t sm:border border-gray-700 p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md animate-fade-in-up pb-8 sm:pb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">Ingresando valor para:</h3>
                <h2 className="text-2xl text-meat-green font-bold">
                  {activeInput === 'unidades' ? 'Unidades' : activeInput === 'pesoTotal' ? 'Peso Bruto (kg)' : activeInput === 'costoKgBruto' ? 'Costo por Kg Bruto ($)' : 'Porcentaje de Desperdicio'}
                </h2>
              </div>
              <button onClick={() => setIsKeypadOpen(false)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center transition shrink-0">
                <span className="text-xl font-bold leading-none">&times;</span>
              </button>
            </div>
            
            {/* Vista previa del valor en grande arriba del teclado */}
            <div className="bg-black/30 border border-gray-700 p-4 rounded-xl mb-6 text-center">
              <span className="text-4xl font-bold text-white">
                {activeInput === 'costoKgBruto' ? '$ ' : ''}
                {getInputValue() || '0'}
                {activeInput === 'pesoTotal' ? ' kg' : activeInput === 'desperdicio' ? '%' : ''}
              </span>
            </div>

            <Keypad 
              value={getInputValue()} 
              onChange={handleInput} 
              onEnter={() => setIsKeypadOpen(false)} 
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default IngresoMercaderia;
