const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Listar productos activos
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE activo = TRUE ORDER BY categoria, nombre');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Crear producto
router.post('/', async (req, res, next) => {
    try {
        const { nombre, categoria, precio_kilo } = req.body;
        if (!nombre || !categoria || !precio_kilo) {
            return res.status(400).json({ error: 'Nombre, categoría y precio son requeridos.' });
        }

        // Check if product already exists
        const [existing] = await db.query('SELECT * FROM productos WHERE nombre = ?', [nombre]);
        if (existing.length > 0) {
            if (existing[0].activo) {
                return res.status(400).json({ error: 'Ya existe un producto activo con ese nombre.' });
            } else {
                // Reactivate and update
                await db.query(
                    'UPDATE productos SET categoria = ?, precio_kilo = ?, activo = TRUE WHERE id = ?',
                    [categoria, precio_kilo, existing[0].id]
                );
                return res.status(200).json({ id: existing[0].id, message: 'Producto reactivado exitosamente.' });
            }
        }

        const [result] = await db.query(
            'INSERT INTO productos (nombre, categoria, precio_kilo) VALUES (?, ?, ?)',
            [nombre, categoria, precio_kilo]
        );
        res.status(201).json({ id: result.insertId, message: 'Producto creado' });
    } catch (error) {
        next(error);
    }
});

// Aumento Masivo de precios
router.put('/aumento-masivo', async (req, res, next) => {
    try {
        const { categoria, porcentaje } = req.body;
        if (!categoria || !porcentaje) {
            return res.status(400).json({ error: 'Categoría y porcentaje son requeridos.' });
        }

        const factor = 1 + (Number(porcentaje) / 100);
        
        const [result] = await db.query(
            'UPDATE productos SET precio_kilo = precio_kilo * ? WHERE categoria = ? AND activo = TRUE',
            [factor, categoria]
        );

        res.json({ message: `Precios actualizados para la categoría ${categoria}`, afectadas: result.affectedRows });
    } catch (error) {
        next(error);
    }
});

// Actualizar producto
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, categoria, precio_kilo } = req.body;
        if (!nombre || !categoria || !precio_kilo) {
            return res.status(400).json({ error: 'Nombre, categoría y precio son requeridos.' });
        }
        const [result] = await db.query(
            'UPDATE productos SET nombre = ?, categoria = ?, precio_kilo = ? WHERE id = ?',
            [nombre, categoria, precio_kilo, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe un producto con ese nombre.' });
        }
        next(error);
    }
});

// Eliminar producto (Borrado Lógico)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('UPDATE productos SET activo = FALSE WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
