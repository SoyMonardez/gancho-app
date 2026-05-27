const express = require('express');
const cors = require('cors');
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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
