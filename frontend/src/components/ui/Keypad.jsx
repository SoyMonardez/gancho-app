import React from 'react';
import Button from './Button';
import { Delete } from 'lucide-react';

const Keypad = ({ value, onChange, onEnter }) => {
  const handlePress = (key) => {
    if (key === 'C') {
      onChange('');
    } else if (key === 'DEL') {
      onChange(value.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) {
        onChange(value + (value === '' ? '0.' : '.'));
      }
    } else {
      onChange(value + key);
    }
  };

  const keys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['.', '0', 'DEL']
  ];

  return (
    <div className="bg-meat-gray p-4 rounded-xl shadow-lg border border-gray-700">
      <div className="mb-4 bg-black text-right p-4 rounded-lg text-3xl font-mono text-meat-green h-[68px] overflow-hidden">
        {value || '0'}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {keys.map((row, rowIndex) => 
          row.map((key) => (
            <Button
              key={`${rowIndex}-${key}`}
              variant="neutral"
              className="text-2xl font-bold bg-gray-800 hover:bg-gray-700"
              onClick={() => handlePress(key)}
            >
              {key === 'DEL' ? <Delete size={28} /> : key}
            </Button>
          ))
        )}
        <Button 
          variant="danger" 
          className="col-span-1 text-xl"
          onClick={() => handlePress('C')}
        >
          Borrar
        </Button>
        <Button 
          variant="primary" 
          className="col-span-2 text-xl"
          onClick={onEnter}
          disabled={!value || value === '0.' || value === '.'}
        >
          Agregar
        </Button>
      </div>
    </div>
  );
};

export default Keypad;
