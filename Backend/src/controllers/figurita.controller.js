const supabase = require('../config/supabase');

// ── Listar catálogo completo de figuritas ──
const getAll = async (req, res) => {
  try {
    const { tipo, pais } = req.query;

    let query = supabase.from('figuritas').select('*');
    if (tipo) query = query.eq('tipo', tipo);       // 'jugador' | 'estadio' | 'sede'
    if (pais) query = query.eq('pais', pais);

    const { data, error } = await query.order('numero', { ascending: true });
    if (error) throw error;

    res.json({ figuritas: data, total: data.length });
  } catch (error) {
    console.error('Error en getAll figuritas:', error);
    res.status(500).json({ error: 'Error al obtener figuritas' });
  }
};

// ── Detalle de una figurita ──
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('figuritas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Figurita no encontrada' });
    }

    res.json({ figurita: data });
  } catch (error) {
    console.error('Error en getById figurita:', error);
    res.status(500).json({ error: 'Error al obtener figurita' });
  }
};

// ── Álbum personal del usuario ──
const getMiAlbum = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const { data, error } = await supabase
      .from('album_usuario')
      .select('*, figuritas(*)')
      .eq('usuario_id', usuarioId);

    if (error) throw error;

    const obtenidas = data.filter(f => f.estado === 'obtenida').length;
    const repetidas = data.filter(f => f.estado === 'repetida').length;

    res.json({
      figuritas: data,
      resumen: { obtenidas, repetidas, total: data.length },
    });
  } catch (error) {
    console.error('Error en getMiAlbum:', error);
    res.status(500).json({ error: 'Error al obtener el álbum' });
  }
};

// ── Actualizar estado de una figurita en el álbum ──
// estados posibles: 'obtenida' | 'repetida' | 'no_tengo'
const updateEstado = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { figurita_id, estado } = req.body;

    if (!figurita_id || !estado) {
      return res.status(400).json({ error: 'figurita_id y estado son requeridos' });
    }

    const estadosValidos = ['obtenida', 'repetida', 'no_tengo'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Use: obtenida, repetida, no_tengo' });
    }

    // Upsert: insertar o actualizar si ya existe
    const { data, error } = await supabase
      .from('album_usuario')
      .upsert(
        { usuario_id: usuarioId, figurita_id, estado },
        { onConflict: 'usuario_id,figurita_id' }
      )
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Estado actualizado', registro: data });
  } catch (error) {
    console.error('Error en updateEstado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

module.exports = { getAll, getById, getMiAlbum, updateEstado };
