const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Rutas
const authRoutes = require('./routes/auth.routes');
const albumRoutes = require('./routes/album.routes');
const figuitaRoutes = require('./routes/figurita.routes');
const intercambioRoutes = require('./routes/intercambio.routes');

const app = express();

// ── Middleware global ──
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5179'], // Ajusta según tu frontend
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Health check ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'AlbumVirtual FIFA', version: '1.0.0' });
});

// ── Rutas de la API ──
app.use('/api/auth', authRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/figuritas', figuitaRoutes);
app.use('/api/intercambios', intercambioRoutes);

// ── Manejo de rutas no encontradas ──
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Manejo global de errores ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
});

module.exports = app;
