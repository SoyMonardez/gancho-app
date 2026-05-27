import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', // primary (green), danger (red), neutral (gray)
  size = 'large',      // large (60px), normal
  className = '',
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center font-bold rounded-xl transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    primary: "bg-meat-green hover:bg-emerald-600 text-white",
    danger: "bg-meat-red hover:bg-red-600 text-white",
    neutral: "bg-meat-gray hover:bg-gray-700 text-white border border-gray-600",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  const sizes = {
    large: "min-h-[60px] px-6 text-lg",
    normal: "min-h-[44px] px-4 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
