import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PuntoVenta from './pages/Vendedor/PuntoVenta';
import Confirmaciones from './pages/Cajero/Confirmaciones';
import CierreCaja from './pages/Cajero/CierreCaja';
import AdminDashboard from './pages/Admin/AdminDashboard';
import IngresoMercaderia from './pages/Recepcion/IngresoMercaderia';
import { ShoppingCart, CheckCircle, Wallet, Settings, Truck } from 'lucide-react';

// Fake Role Selector for MVP
const RoleSelector = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-meat-dark text-white">
      <h1 className="text-3xl font-bold mb-8 text-center text-meat-light">Génesis Meat <span className="text-meat-green">MVP</span></h1>
      <p className="mb-6 text-gray-400 text-center">Selecciona tu rol para acceder al sistema:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Link to="/vendedor" className="flex items-center gap-3 bg-meat-gray p-6 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-meat-green">
          <ShoppingCart size={32} className="text-meat-green" />
          <div className="text-left">
            <h2 className="text-xl font-bold">Vendedor</h2>
            <p className="text-sm text-gray-400">Punto de Venta</p>
          </div>
        </Link>

        <Link to="/cajero/confirmaciones" className="flex items-center gap-3 bg-meat-gray p-6 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-blue-500">
          <CheckCircle size={32} className="text-blue-500" />
          <div className="text-left">
            <h2 className="text-xl font-bold">Cajero</h2>
            <p className="text-sm text-gray-400">Confirmar Ventas</p>
          </div>
        </Link>

        <Link to="/cajero/cierre" className="flex items-center gap-3 bg-meat-gray p-6 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-yellow-500">
          <Wallet size={32} className="text-yellow-500" />
          <div className="text-left">
            <h2 className="text-xl font-bold">Supervisor</h2>
            <p className="text-sm text-gray-400">Cierre de Caja</p>
          </div>
        </Link>

        <Link to="/recepcion" className="flex items-center gap-3 bg-meat-gray p-6 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-orange-500">
          <Truck size={32} className="text-orange-500" />
          <div className="text-left">
            <h2 className="text-xl font-bold">Bodega / Recepción</h2>
            <p className="text-sm text-gray-400">Ingreso de Mercadería</p>
          </div>
        </Link>

        <Link to="/admin/precios" className="flex items-center gap-3 bg-meat-gray p-6 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-purple-500 md:col-span-2 justify-center">
          <Settings size={32} className="text-purple-500" />
          <div className="text-left md:text-center">
            <h2 className="text-xl font-bold">Administración General</h2>
            <p className="text-sm text-gray-400">Aumentos Masivos y Catálogo</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelector />} />
        
        <Route element={<MainLayout />}>
          <Route path="/vendedor" element={<PuntoVenta />} />
          <Route path="/cajero/confirmaciones" element={<Confirmaciones />} />
          <Route path="/cajero/cierre" element={<CierreCaja />} />
          <Route path="/admin/precios" element={<AdminDashboard />} />
          <Route path="/recepcion" element={<IngresoMercaderia />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
