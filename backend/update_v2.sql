-- Add activo column if it doesn't exist (MySQL syntax workaround for IF NOT EXISTS column is complex, we just run it and ignore if error, or just run it directly)
ALTER TABLE productos ADD COLUMN activo BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS ingresos_mercaderia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    unidades INT NOT NULL,
    peso_total DECIMAL(10,2) NOT NULL,
    porcentaje_desperdicio DECIMAL(5,2) DEFAULT 25.00,
    peso_neto DECIMAL(10,2) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
