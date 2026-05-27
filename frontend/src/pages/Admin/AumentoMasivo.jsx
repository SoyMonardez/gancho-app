import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Keypad from '../../components/ui/Keypad';
import { Settings, TrendingUp } from 'lucide-react';

const AumentoMasivo = () => {
  const [categoria, setCategoria] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [loading, setLoading] = useState(false);

  const categorias = ['Vaca', 'Pollo', 'Cerdo']; // Se podría traer del backend, pero lo harcodeamos para el MVP

  const handleAumento = async () => {
    if (!categoria || !porcentaje) return;
    if (!window.confirm(`¿Aumentar ${porcentaje}% a todos los productos de la categoría ${categoria}?`)) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/productos/aumento-masivo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoria, porcentaje: parseFloat(porcentaje) })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert(`¡Éxito! ${data.message}. (Productos afectados: ${data.afectadas})`);
      setCategoria('');
      setPorcentaje('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-meat-light flex items-center gap-2">
        <Settings /> Aumento Masivo de Precios
      </h2>

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
          <TrendingUp className="mr-2" /> Aplicar Aumento
        </Button>
      </div>
    </div>
  );
};

export default AumentoMasivo;
