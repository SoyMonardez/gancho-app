CREATE DATABASE IF NOT EXISTS genesis_meat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE genesis_meat;

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    precio_kilo DECIMAL(10,2) NOT NULL,
    stock_estimado_kg DECIMAL(10,3) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_nombre (nombre)
);

CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('Efectivo', 'Transferencia') NOT NULL,
    estado ENUM('Pendiente', 'Confirmada') DEFAULT 'Pendiente',
    archivada BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    kilos DECIMAL(10,3) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS cierres_caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monto_sistema DECIMAL(10,2) NOT NULL,
    monto_fisico_empleado DECIMAL(10,2) NOT NULL,
    diferencia DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingresos_mercaderia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    unidades INT NOT NULL,
    peso_total DECIMAL(10,3) NOT NULL,
    porcentaje_desperdicio DECIMAL(5,2) DEFAULT 25.00,
    peso_neto DECIMAL(10,3) NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
