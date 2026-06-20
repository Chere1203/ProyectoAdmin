const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const supabase = require('../config/supabase');

router.use(authMiddleware);

// GET /api/intercambios — listar figuritas repetidas disponibles de otros usuarios
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Obtener album_usuario donde estado = 'repetida' y usuario_id != usuario actual
    const { data, error } = await supabase
      .from('album_usuario')
      .select('id, usuario_id, figurita_id, estado, updated_at, figuritas(*), usuarios(*)')
      .neq('usuario_id', usuarioId)
      .eq('estado', 'repetida');

    if (error) throw error;

    // Mapear respuesta para frontend
    const disponibles = data.map((row) => ({
      album_id: row.id,
      propietario: row.usuarios || { id: row.usuario_id },
      figurita: row.figuritas,
    }));

    res.json({ disponibles });
  } catch (error) {
    console.error('Error en GET /api/intercambios:', error);
    res.status(500).json({ error: 'Error al obtener intercambios disponibles' });
  }
});

// POST /api/intercambios — crear una oferta de intercambio
// body: { receptor_id, figurita_ofrecida_id, figurita_solicitada_id }
router.post('/', async (req, res) => {
  try {
    const solicitante_id = req.user.id;
    const { receptor_id, figurita_ofrecida_id, figurita_solicitada_id } = req.body;

    if (!receptor_id || !figurita_ofrecida_id || !figurita_solicitada_id) {
      return res.status(400).json({ error: 'Faltan datos requeridos para la oferta' });
    }

    const { data, error } = await supabase
      .from('intercambios')
      .insert([{ solicitante_id, receptor_id, figurita_ofrecida_id, figurita_solicitada_id }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Oferta creada', intercambio: data });
  } catch (error) {
    console.error('Error en POST /api/intercambios:', error);
    res.status(500).json({ error: 'Error al crear la oferta' });
  }
});

// GET /api/intercambios/recibidos — ofertas donde soy el receptor
router.get('/recibidos', async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const { data, error } = await supabase
      .from('intercambios')
      .select(
        'id, solicitante_id, receptor_id, estado, figurita_ofrecida_id, figurita_solicitada_id, created_at, solicitante:solicitante_id(id, nombre, email), figurita_ofrecida:figurita_ofrecida_id(*), figurita_solicitada:figurita_solicitada_id(*)'
      )
      .eq('receptor_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ recibidos: data });
  } catch (error) {
    console.error('Error en GET /api/intercambios/recibidos:', error);
    res.status(500).json({ error: 'Error al obtener ofertas recibidas' });
  }
});

// POST /api/intercambios/:id/accion — aceptar o rechazar oferta
router.post('/:id/accion', async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;
    const { accion } = req.body; // 'aceptar' | 'rechazar'

    if (!['aceptar', 'rechazar'].includes(accion)) {
      return res.status(400).json({ error: 'Acción inválida' });
    }

    // Obtener intercambio
    const { data: intercambio, error: getErr } = await supabase
      .from('intercambios')
      .select('*')
      .eq('id', id)
      .single();

    if (getErr || !intercambio) return res.status(404).json({ error: 'Intercambio no encontrado' });
    if (intercambio.receptor_id !== usuarioId) return res.status(403).json({ error: 'No autorizado' });

    const nuevoEstado = accion === 'aceptar' ? 'aceptado' : 'rechazado';

    // Actualizar estado del intercambio
    const { data, error: updErr } = await supabase
      .from('intercambios')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select()
      .single();

    if (updErr) throw updErr;

    // Si se acepta, marcar en album_usuario que receptor obtuvo la figurita solicitada
    if (accion === 'aceptar') {
      const receptor_id = intercambio.receptor_id;
      const figurita_id = intercambio.figurita_solicitada_id;
      await supabase
        .from('album_usuario')
        .upsert({ usuario_id: receptor_id, figurita_id, estado: 'obtenida' }, { onConflict: 'usuario_id,figurita_id' });
    }

    res.json({ message: 'Acción ejecutada', intercambio: data });
  } catch (error) {
    console.error('Error en POST /api/intercambios/:id/accion:', error);
    res.status(500).json({ error: 'Error al procesar la acción' });
  }
});

module.exports = router;
