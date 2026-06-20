const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// TODO Sprint 2: GET /api/album/progreso
router.get('/progreso', (req, res) => {
  res.json({ message: 'Endpoint de álbum - Sprint 2' });
});

module.exports = router;
