import React from 'react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'alert', // 'alert' o 'confirm'
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-meat-gray border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-fade-in-up">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          {type === 'confirm' && (
            <Button 
              variant="neutral" 
              size="normal" 
              className="flex-1"
              onClick={onClose}
            >
              {cancelText}
            </Button>
          )}
          <Button 
            variant="primary" 
            size="normal" 
            className="flex-1"
            onClick={() => {
              if (onConfirm) onConfirm();
              if (type === 'alert') onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
