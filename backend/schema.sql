-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS genesis_meat;
USE genesis_meat;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL,
    precio_kilo DECIMAL(10, 2) NOT NULL,
    stock_estimado_kg DECIMAL(10, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de ingresos de mercaderia
CREATE TABLE IF NOT EXISTS ingresos_mercaderia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    unidades INT NOT NULL,
    peso_total DECIMAL(10,2) NOT NULL,
    porcentaje_desperdicio DECIMAL(5,2) DEFAULT 25.00,
    peso_neto DECIMAL(10,2) NOT NULL,
    costo_total DECIMAL(12,2) DEFAULT 0,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas
-- metodo_pago: 'Efectivo', 'Transferencia'
-- estado: 'Pendiente', 'Confirmada'
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    archivada BOOLEAN DEFAULT FALSE
);

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    kilos DECIMAL(10, 3) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Tabla de cierres de caja
CREATE TABLE IF NOT EXISTS cierres_caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    monto_sistema DECIMAL(10, 2) NOT NULL,
    monto_fisico_empleado DECIMAL(10, 2) NOT NULL,
    diferencia DECIMAL(10, 2) NOT NULL
);

-- Insertar algunos productos de prueba
INSERT INTO productos (nombre, categoria, precio_kilo, stock_estimado_kg) VALUES
('Asado de Tira', 'Vaca', 8500.00, 50.5),
('Vacío', 'Vaca', 9200.00, 30.0),
('Pechuga', 'Pollo', 4500.00, 20.0),
('Pata Muslo', 'Pollo', 3200.00, 40.0),
('Bondiola', 'Cerdo', 6800.00, 15.0),
('Pechito', 'Cerdo', 5500.00, 25.0)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
