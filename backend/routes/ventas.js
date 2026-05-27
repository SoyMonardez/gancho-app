const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Listar ventas pendientes (Transferencias por confirmar)
router.get('/pendientes', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM ventas WHERE estado = "Pendiente" AND archivada = FALSE ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Crear nueva venta
// Body: { metodo_pago: 'Efectivo'|'Transferencia', productos: [{ producto_id, kilos, subtotal }] }
router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { metodo_pago, productos } = req.body;
        if (!metodo_pago || !productos || productos.length === 0) {
            return res.status(400).json({ error: 'Faltan datos de la venta.' });
        }

        const total = productos.reduce((sum, p) => sum + p.subtotal, 0);
        // Si es efectivo se confirma automáticamente, si es transferencia queda pendiente
        const estado = metodo_pago === 'Efectivo' ? 'Confirmada' : 'Pendiente';

        // Insertar Venta
        const [ventaResult] = await connection.query(
            'INSERT INTO ventas (total, metodo_pago, estado) VALUES (?, ?, ?)',
            [total, metodo_pago, estado]
        );
        const ventaId = ventaResult.insertId;

        // Insertar Detalles
        for (const p of productos) {
            await connection.query(
                'INSERT INTO detalle_ventas (venta_id, producto_id, kilos, subtotal) VALUES (?, ?, ?, ?)',
                [ventaId, p.producto_id, p.kilos, p.subtotal]
            );
        }

        // Si es Efectivo, descontar stock de una vez
        if (estado === 'Confirmada') {
            for (const p of productos) {
                await connection.query(
                    'UPDATE productos SET stock_estimado_kg = stock_estimado_kg - ? WHERE id = ?',
                    [p.kilos, p.producto_id]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Venta registrada con éxito', id: ventaId, estado });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

// Confirmar venta (Cajero)
router.put('/:id/confirmar', async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();

        const [ventas] = await connection.query('SELECT * FROM ventas WHERE id = ?', [id]);
        if (ventas.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        if (ventas[0].estado === 'Confirmada') {
            return res.status(400).json({ error: 'La venta ya estaba confirmada' });
        }

        // Actualizar estado a confirmada
        await connection.query('UPDATE ventas SET estado = "Confirmada" WHERE id = ?', [id]);

        // Descontar stock ahora que está confirmada
        const [detalles] = await connection.query('SELECT * FROM detalle_ventas WHERE venta_id = ?', [id]);
        for (const d of detalles) {
            await connection.query(
                'UPDATE productos SET stock_estimado_kg = stock_estimado_kg - ? WHERE id = ?',
                [d.kilos, d.producto_id]
            );
        }

        await connection.commit();
        res.json({ message: 'Venta confirmada exitosamente' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

// Obtener historial completo de ventas
router.get('/historial', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM ventas ORDER BY fecha DESC LIMIT 500');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Archivar ventas del día (Limpiar el día)
router.post('/archivar-dia', async (req, res, next) => {
    try {
        const [result] = await db.query('UPDATE ventas SET archivada = TRUE WHERE archivada = FALSE');
        res.json({ message: 'El día ha sido cerrado y las ventas archivadas.', afectadas: result.affectedRows });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
