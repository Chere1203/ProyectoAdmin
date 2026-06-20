import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { figuritaService } from '../services/api';

const ESTADO_CONFIG = {
  obtenida: { label: 'Tengo', dot: 'bg-green-400', border: 'border-green-400', glow: 'shadow-green-300' },
  repetida: { label: 'Repetida', dot: 'bg-yellow-400', border: 'border-yellow-400', glow: 'shadow-yellow-200' },
  no_tengo: { label: 'Me falta', dot: 'bg-gray-400', border: 'border-transparent', glow: '' },
};

// Agrupar figuritas por país/sección (de a 12 por página doble)
function agruparPorPais(figuritas) {
  const grupos = {};
  figuritas.forEach(f => {
    const key = f.tipo === 'estadio' ? '🏟️ Estadios & Sedes' : (f.pais || 'Otros');
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(f);
  });
  return grupos;
}

// Banderas por país (emoji)
const BANDERAS = {
  'Argentina': '🇦🇷', 'Portugal': '🇵🇹', 'Francia': '🇫🇷',
  'Noruega': '🇳🇴', 'Brasil': '🇧🇷', 'España': '🇪🇸',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Italia': '🇮🇹', 'Canadá': '🇨🇦',
  'Alemania': '🇩🇪', 'México': '🇲🇽', 'Estados Unidos': '🇺🇸',
};

function FigurCard({ figurita, estado, onCambiar }) {
  const cfg = ESTADO_CONFIG[estado];
  const imgSrc = figurita.imagen_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(figurita.nombre)}&backgroundColor=1B4F72&textColor=ffffff`;

  return (
    <div className={`relative flex flex-col rounded-lg overflow-hidden border-2 ${cfg.border} transition-all duration-200 hover:scale-105 hover:shadow-lg ${cfg.glow} bg-white`}
      style={{ minHeight: '160px' }}>

      {/* Número de figurita */}
      <div className="absolute top-1 left-1 z-10 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
        #{figurita.numero}
      </div>

      {/* Indicador de estado */}
      <div className={`absolute top-1 right-1 z-10 w-3 h-3 rounded-full ${cfg.dot} border border-white shadow`} />

      {/* Imagen */}
      <Link to={`/figuritas/${figurita.id}`} className="block">
        <div className="w-full h-24 bg-gradient-to-b from-[#1B4F72] to-[#2874A6] flex items-center justify-center overflow-hidden">
          {figurita.imagen_url ? (
            <img src={figurita.imagen_url} alt={figurita.nombre}
              className="w-full h-full object-cover object-top"
              onError={e => { e.currentTarget.src = imgSrc; e.currentTarget.onerror = null; }} />
          ) : (
            <div className="text-4xl">
              {figurita.tipo === 'jugador' ? '⚽' : '🏟️'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-1.5 py-1.5 bg-white text-center flex-1">
          <p className="text-[11px] font-bold text-gray-800 leading-tight truncate">{figurita.nombre}</p>
          {figurita.posicion && <p className="text-[9px] text-gray-500 uppercase">{figurita.posicion}</p>}
          {figurita.club && <p className="text-[9px] text-[#1B4F72] font-medium truncate">{figurita.club}</p>}
        </div>
      </Link>

      {/* Selector de estado */}
      <div className="px-1.5 pb-1.5 bg-white">
        <select value={estado} onChange={e => onCambiar(figurita.id, e.target.value)}
          className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5 bg-gray-50 text-gray-700 cursor-pointer">
          <option value="no_tengo">Me falta</option>
          <option value="obtenida">Tengo</option>
          <option value="repetida">Repetida</option>
        </select>
      </div>
    </div>
  );
}

// Placeholder para figurita vacía
function EmptyCard({ numero }) {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden border-2 border-dashed border-white/30 bg-white/10"
      style={{ minHeight: '160px' }}>
      <div className="flex-1 flex items-center justify-center text-white/30 text-xs font-bold">
        {numero ? `#${numero}` : '?'}
      </div>
    </div>
  );
}

export default function AlbumPage() {
  const [figuritas, setFiguritas] = useState([]);
  const [miAlbum, setMiAlbum] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(0);

  useEffect(() => {
    // mover carga de datos a función para poder invocarla desde eventos externos
    const cargarDatos = async () => {
      try {
        const [catRes, albumRes] = await Promise.all([
          figuritaService.getAll(),
          figuritaService.getMiAlbum(),
        ]);
        setFiguritas(catRes.data.figuritas);
        const mapaAlbum = {};
        albumRes.data.figuritas.forEach(f => { mapaAlbum[f.figurita_id] = f.estado; });
        setMiAlbum(mapaAlbum);
      } catch (err) {
        console.error('Error cargando álbum:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();

    const onAlbumUpdated = () => {
      setLoading(true);
      cargarDatos();
    };
    window.addEventListener('albumUpdated', onAlbumUpdated);
    return () => window.removeEventListener('albumUpdated', onAlbumUpdated);
  }, []);

  const cambiarEstado = async (figuritaId, nuevoEstado) => {
    try {
      await figuritaService.updateEstado(figuritaId, nuevoEstado);
      setMiAlbum(prev => ({ ...prev, [figuritaId]: nuevoEstado }));
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  // Filtrar figuritas según filtro activo
  const figuritasFiltradas = figuritas.filter(f => {
    if (filtro === 'todos') return true;
    return (miAlbum[f.id] || 'no_tengo') === filtro;
  });

  // Agrupar por país para mostrar en páginas
  const grupos = agruparPorPais(figuritasFiltradas);
  const paisesOrdenados = Object.keys(grupos).sort();

  // Paginar: 12 figuritas por spread (2 páginas de 6)
  const CARDS_POR_SPREAD = 12;
  const todasFlat = figuritasFiltradas; // planas para paginación simple
  const totalPaginas = Math.ceil(todasFlat.length / CARDS_POR_SPREAD);
  const paginaFigs = todasFlat.slice(paginaActual * CARDS_POR_SPREAD, (paginaActual + 1) * CARDS_POR_SPREAD);
  const pagIzq = paginaFigs.slice(0, 6);
  const pagDer = paginaFigs.slice(6, 12);

  // Stats
  const repetidas = Object.values(miAlbum).filter(e => e === 'repetida').length;
  const obtenidas = Object.values(miAlbum).filter(e => e === 'obtenida' || e === 'repetida').length;
  const total = figuritas.length;
  const porcentaje = total > 0 ? Math.round((obtenidas / total) * 100) : 0;

  // País/sección de la página actual
  const seccionActual = paginaFigs[0]?.pais || (paginaFigs[0]?.tipo === 'estadio' ? 'Estadios' : '');
  const bandera = BANDERAS[seccionActual] || '';

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3">🎴</div>
        <p className="text-primary font-semibold">Cargando álbum...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">🎴 Mi Álbum Virtual FIFA</h1>
          <p className="text-sm text-gray-500">FutbolCard CR · Mundial 2026</p>
        </div>
        {/* Progreso compacto */}
        <div className="text-right">
          <p className="text-sm font-semibold text-primary">{porcentaje}% completado</p>
          <p className="text-xs text-gray-500">{obtenidas} de {total} figuritas</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to="/intercambio"
          className="
      flex items-center gap-2
      bg-gradient-to-r
      from-purple-600
      to-pink-600
      text-white
      px-6
      py-3
      rounded-2xl
      font-semibold
      shadow-lg
      hover:scale-105
      hover:shadow-xl
      transition-all
    "
        >
          🔄 Zona de Intercambio
        </Link>

        <button
          className="
      flex items-center gap-2
      bg-white
      border
      border-gray-300
      px-6
      py-3
      rounded-2xl
      font-semibold
      text-gray-700
    "
        >
          🎯 Mis Repetidas: {repetidas}
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-5">
        <div className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${porcentaje}%` }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { val: obtenidas, label: 'Obtenidas', bg: 'bg-green-50 border-green-200', txt: 'text-green-700' },
          { val: repetidas, label: 'Repetidas', bg: 'bg-yellow-50 border-yellow-200', txt: 'text-yellow-700' },
          { val: total - obtenidas, label: 'Me faltan', bg: 'bg-blue-50 border-blue-200', txt: 'text-blue-700' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${s.txt}`}>{s.val}</p>
            <p className={`text-xs ${s.txt} opacity-80`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: 'todos', label: 'Todas' },
          { key: 'obtenida', label: '✅ Tengo' },
          { key: 'repetida', label: '🔁 Repetidas' },
          { key: 'no_tengo', label: '❌ Me faltan' },
        ].map(f => (
          <button key={f.key} onClick={() => { setFiltro(f.key); setPaginaActual(0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all
              ${filtro === f.key
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ── ÁLBUM SPREAD ── */}
      {todasFlat.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No hay figuritas en este filtro.</p>
      ) : (
        <div className="relative">

          {/* Encabezado de sección tipo álbum FIFA */}
          {seccionActual && (
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300" />
              <div className="flex items-center gap-2 bg-primary text-white px-5 py-1.5 rounded-full shadow text-sm font-bold tracking-wide uppercase">
                <span className="text-lg">{bandera}</span>
                <span>{seccionActual}</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300" />
            </div>
          )}

          {/* Spread: dos páginas */}
          <div className="flex gap-1 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #d4336b 0%, #9b1742 50%, #6b213f 100%)' }}>

            {/* Página izquierda */}
            <div className="flex-1 p-5 rounded-l-2xl"
              style={{ background: 'linear-gradient(160deg, #1a6b9e 0%, #0b4f72 100%)' }}>
              {/* Marca de agua del país */}
              <div className="text-white/10 text-6xl font-black text-center mb-3 select-none uppercase tracking-widest">
                {seccionActual?.substring(0, 3) || 'FIFA'}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) =>
                  pagIzq[i]
                    ? <FigurCard key={pagIzq[i].id} figurita={pagIzq[i]}
                      estado={miAlbum[pagIzq[i].id] || 'no_tengo'} onCambiar={cambiarEstado} />
                    : <EmptyCard key={`empty-l-${i}`} />
                )}
              </div>
            </div>

            {/* Lomo del álbum */}
            <div className="w-4 bg-gradient-to-b from-gray-900 via-gray-700 to-gray-900 flex items-center justify-center shadow-inner">
              <div className="text-white/20 text-[8px] rotate-90 whitespace-nowrap tracking-widest uppercase">
                Album Virtual FIFA 2026
              </div>
            </div>

            {/* Página derecha */}
            <div className="flex-1 p-5 rounded-r-2xl"
              style={{ background: 'linear-gradient(160deg, #1a6b9e 0%, #0b4f72 100%)' }}>
              <div className="text-white/10 text-6xl font-black text-center mb-3 select-none uppercase tracking-widest">
                2026
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) =>
                  pagDer[i]
                    ? <FigurCard key={pagDer[i].id} figurita={pagDer[i]}
                      estado={miAlbum[pagDer[i].id] || 'no_tengo'} onCambiar={cambiarEstado} />
                    : <EmptyCard key={`empty-r-${i}`} />
                )}
              </div>
            </div>
          </div>

          {/* Pie del álbum */}
          <div className="mt-3 flex justify-between items-center px-2">
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Tengo</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Repetida</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Me falta</span>
            </div>
            <div className="bg-[#6b213f] text-white text-xs px-4 py-1.5 rounded-full font-semibold shadow">
              FutbolCard CR · FIFA 2026
            </div>
          </div>

          {/* Navegación de páginas */}
          <div className="flex justify-center items-center gap-4 mt-5">
            <button
              onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
              disabled={paginaActual === 0}
              className="w-10 h-10 rounded-full bg-primary text-white shadow flex items-center justify-center disabled:opacity-30 hover:bg-secondary transition-colors text-lg">
              ◀
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Páginas {paginaActual * 2 + 1}–{paginaActual * 2 + 2} de {totalPaginas * 2}
            </span>
            <button
              onClick={() => setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))}
              disabled={paginaActual >= totalPaginas - 1}
              className="w-10 h-10 rounded-full bg-primary text-white shadow flex items-center justify-center disabled:opacity-30 hover:bg-secondary transition-colors text-lg">
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}