import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, CheckCircle, Wallet, Settings, Home } from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.includes('/vendedor')) return 'Punto de Venta';
    if (location.pathname.includes('/confirmaciones')) return 'Confirmar Transferencias';
    if (location.pathname.includes('/cierre')) return 'Cierre de Caja';
    if (location.pathname.includes('/precios')) return 'Panel de Control';
    return 'Génesis Meat';
  };

  return (
    <div className="flex flex-col h-dvh bg-meat-dark text-meat-light overflow-hidden">
      {/* Header */}
      <header className="bg-meat-gray border-b border-gray-700 p-4 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <Home size={24} className="text-gray-300" />
          </Link>
          <h1 className="text-xl font-bold text-white truncate">{getTitle()}</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile (optional, but good for MVP) */}
      <nav className="bg-meat-gray border-t border-gray-700 p-2 shrink-0 md:hidden pb-safe">
        <ul className="flex justify-around items-center">
          <li>
            <Link to="/vendedor" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname.includes('/vendedor') ? 'text-meat-green' : 'text-gray-400'}`}>
              <ShoppingCart size={24} />
              <span className="text-xs mt-1">Venta</span>
            </Link>
          </li>
          <li>
            <Link to="/cajero/confirmaciones" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname.includes('/confirmaciones') ? 'text-blue-500' : 'text-gray-400'}`}>
              <CheckCircle size={24} />
              <span className="text-xs mt-1">Confirmar</span>
            </Link>
          </li>
          <li>
            <Link to="/cajero/cierre" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname.includes('/cierre') ? 'text-yellow-500' : 'text-gray-400'}`}>
              <Wallet size={24} />
              <span className="text-xs mt-1">Caja</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/precios" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname.includes('/precios') ? 'text-purple-500' : 'text-gray-400'}`}>
              <Settings size={24} />
              <span className="text-xs mt-1">Admin</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MainLayout;
