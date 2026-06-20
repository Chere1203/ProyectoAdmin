const express = require('express');
const router = express.Router();
const figuritaController = require('../controllers/figurita.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/figuritas — Listar todas las figuritas del catálogo
router.get('/', figuritaController.getAll);

// Rutas específicas primero: álbum del usuario y actualizaciones
// GET /api/figuritas/mi-album — Figuritas del usuario autenticado
router.get('/mi-album/estado', figuritaController.getMiAlbum);

// POST /api/figuritas/mi-album — Agregar/actualizar estado de una figurita
router.post('/mi-album', figuritaController.updateEstado);

// GET /api/figuritas/:id — Detalle de una figurita (jugador/estadio)
router.get('/:id', figuritaController.getById);

module.exports = router;
