const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Realizar cierre de caja ciego
// Solo se envía el monto físico
router.post('/cierre-ciego', async (req, res, next) => {
    try {
        const { monto_fisico_empleado } = req.body;

        if (monto_fisico_empleado === undefined) {
            return res.status(400).json({ error: 'Se requiere el monto físico contado.' });
        }

        // Calcular las ventas confirmadas EN EFECTIVO del día (hoy) local de MySQL
        const [ventasResult] = await db.query(
            'SELECT COALESCE(SUM(total), 0) AS total_sistema FROM ventas WHERE metodo_pago = "Efectivo" AND estado = "Confirmada" AND archivada = FALSE AND DATE(fecha) = CURRENT_DATE()'
        );

        const monto_sistema = ventasResult[0].total_sistema;
        const diferencia = monto_fisico_empleado - monto_sistema;

        const [insertResult] = await db.query(
            'INSERT INTO cierres_caja (monto_sistema, monto_fisico_empleado, diferencia) VALUES (?, ?, ?)',
            [monto_sistema, monto_fisico_empleado, diferencia]
        );

        res.json({
            message: 'Cierre registrado',
            id: insertResult.insertId,
            monto_sistema: Number(monto_sistema),
            monto_fisico: Number(monto_fisico_empleado),
            diferencia: Number(diferencia)
        });
    } catch (error) {
        next(error);
    }
});

// Obtener resumen del día
router.get('/resumen-dia', async (req, res, next) => {
    try {
        const [resultados] = await db.query(
            `SELECT 
                metodo_pago, 
                COALESCE(SUM(total), 0) AS total_dia 
            FROM ventas 
            WHERE estado = "Confirmada" AND archivada = FALSE AND DATE(fecha) = CURRENT_DATE() 
            GROUP BY metodo_pago`
        );

        let total_efectivo = 0;
        let total_transferencia = 0;

        resultados.forEach(row => {
            if (row.metodo_pago === 'Efectivo') total_efectivo = Number(row.total_dia);
            if (row.metodo_pago === 'Transferencia') total_transferencia = Number(row.total_dia);
        });

        res.json({
            total_efectivo,
            total_transferencia,
            total_general: total_efectivo + total_transferencia
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
