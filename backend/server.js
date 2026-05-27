const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');
require('dotenv').config();

const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const cajaRoutes = require('./routes/caja');
const estadisticasRoutes = require('./routes/estadisticas');
const mercaderiaRoutes = require('./routes/mercaderia');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/mercaderia', mercaderiaRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
});

async function initializeDatabase() {
    try {
        // Comprobar si la tabla productos ya existe
        await db.query('SELECT 1 FROM productos LIMIT 1');
        console.log('La base de datos ya está inicializada.');
    } catch (error) {
        console.log('Base de datos no inicializada. Cargando schema.sql...');
        try {
            const sqlPath = path.join(__dirname, 'schema.sql');
            if (fs.existsSync(sqlPath)) {
                const sqlContent = fs.readFileSync(sqlPath, 'utf8');
                // Separar por ';'
                const queries = sqlContent
                    .split(';')
                    .map(query => query.trim())
                    .filter(query => query.length > 0 && !query.startsWith('--'));

                for (const query of queries) {
                    await db.query(query);
                }
                console.log('Base de datos inicializada correctamente con schema.sql.');
            } else {
                console.warn('No se encontró el archivo schema.sql.');
            }
        } catch (dbErr) {
            console.error('Error al ejecutar schema.sql:', dbErr);
        }
    }
}

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    await initializeDatabase();
});

