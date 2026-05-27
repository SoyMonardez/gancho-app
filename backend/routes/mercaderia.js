const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Registrar nuevo ingreso de mercadería
router.post('/', async (req, res, next) => {
    try {
        const { categoria, unidades, peso_total, porcentaje_desperdicio, costo_kg_bruto } = req.body;

        if (!categoria || !unidades || !peso_total || costo_kg_bruto === undefined) {
            return res.status(400).json({ error: 'Categoría, unidades, peso total y costo por kg bruto son requeridos.' });
        }

        const desp = porcentaje_desperdicio || 25.00;
        const neto = peso_total * (1 - (desp / 100));
        
        // La inversión total es el peso bruto multiplicado por lo que costó cada kilo bruto
        const costo_bruto_unit = parseFloat(costo_kg_bruto) || 0;
        const costo = peso_total * costo_bruto_unit; 
        
        const costo_real_kilo = neto > 0 ? (costo / neto) : 0;

        // Insertar en la BD
        const [result] = await db.query(
            'INSERT INTO ingresos_mercaderia (categoria, unidades, peso_total, porcentaje_desperdicio, peso_neto, costo_total) VALUES (?, ?, ?, ?, ?, ?)',
            [categoria, unidades, peso_total, desp, neto, costo]
        );

        // Calcular promedio de venta para esta categoría
        const [prodRows] = await db.query(
            'SELECT AVG(precio_kilo) as precio_promedio FROM productos WHERE categoria = ? AND activo = TRUE',
            [categoria]
        );

        const precioPromedio = prodRows[0].precio_promedio || 0;
        const proyeccion = neto * precioPromedio;

        res.status(201).json({
            id: result.insertId,
            message: 'Ingreso registrado correctamente.',
            peso_neto: neto,
            precio_promedio: precioPromedio,
            proyeccion: proyeccion,
            inversion_total: costo,
            costo_real_kilo: costo_real_kilo
        });

    } catch (error) {
        next(error);
    }
});

// Opcional: Obtener historial de ingresos
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM ingresos_mercaderia ORDER BY fecha DESC LIMIT 50');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
