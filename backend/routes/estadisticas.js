const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener ventas agrupadas por día para la gráfica
router.get('/grafica', async (req, res, next) => {
    try {
        // Agrupar por fecha (solo el día) y sumar total
        // Dependiendo del motor SQL la función de fecha cambia. En MySQL: DATE(fecha)
        const [rows] = await db.query(`
            SELECT 
                DATE(fecha) as dia, 
                SUM(total) as total_dia
            FROM ventas
            WHERE estado = 'Confirmada'
            GROUP BY DATE(fecha)
            ORDER BY dia DESC
            LIMIT 30
        `);

        // Revertir para que el orden cronológico sea de izq a derecha en el gráfico
        res.json(rows.reverse());
    } catch (error) {
        next(error);
    }
});

module.exports = router;
