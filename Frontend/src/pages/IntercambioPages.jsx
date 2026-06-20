import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { figuritaService, intercambioService } from '../services/api';

export default function IntercambioPage() {
  const [repetidas, setRepetidas] = useState([]); // user's repeated
  const [disponibles, setDisponibles] = useState([]); // others' repeated
  const [recibidos, setRecibidos] = useState([]); // offers received
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [selectedOwn, setSelectedOwn] = useState(null);
  const [feedback, setFeedback] = useState('');
  // Función reutilizable para cargar datos de intercambio y álbum
  const cargarDatos = async () => {
    try {
      // Obtener todas las figuritas y el álbum del usuario
      const [catRes, albumRes, dispRes] = await Promise.all([
        figuritaService.getAll(),
        figuritaService.getMiAlbum(),
        intercambioService.getDisponibles(),
      ]);

      // Crear un mapa con el estado de cada figurita del usuario
      const mapaEstados = {};
      albumRes.data.figuritas.forEach((f) => {
        mapaEstados[f.figurita_id] = f.estado;
      });

      // Filtrar únicamente las repetidas del usuario
      const repetidasUsuario = catRes.data.figuritas.filter(
        (figurita) => mapaEstados[figurita.id] === 'repetida'
      );

      setRepetidas(repetidasUsuario);

      // Disponibles vienen del endpoint de intercambios
      const disponiblesList = (dispRes.data.disponibles || []).map(d => ({
        album_id: d.album_id,
        propietario: d.propietario,
        figurita: d.figurita,
      }));
      setDisponibles(disponiblesList);

      // Cargar ofertas recibidas
      try {
        const recibRes = await intercambioService.getRecibidos();
        setRecibidos(recibRes.data.recibidos || []);
      } catch (err) {
        console.error('No se pudieron cargar ofertas recibidas', err);
        setRecibidos([]);
      }
    } catch (error) {
      console.error('Error cargando repetidas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Handler para aceptar/rechazar ofertas
  const handleAccion = async (id, accion) => {
    try {
      await intercambioService.accionOffer(id, accion);
      // refrescar datos
      // notificar al álbum que se actualice (aceptar marca la figurita como obtenida)
      try { window.dispatchEvent(new Event('albumUpdated')); } catch (e) { /* ignore */ }
      setLoading(true);
      await cargarDatos();
    } catch (err) {
      console.error('Error al ejecutar acción:', err);
      alert(err.response?.data?.error || 'Error al procesar la acción');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-primary font-semibold">
          Cargando zona de intercambio...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Encabezado */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">
          🔄 Zona de Intercambio
        </h1>

        <p className="text-white/90">
          Tienes {repetidas.length} figuritas disponibles para intercambiar.
        </p>
      </div>

      {/* Zona de intercambio: disponibles de otros usuarios */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Figuritas disponibles de otros usuarios</h2>

        {disponibles.length === 0 ? (
          <p className="text-gray-500">No hay figuritas disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {disponibles.map((item) => (
              <div key={item.album_id} className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="h-28 bg-gradient-to-b from-indigo-400 to-indigo-600 flex items-center justify-center text-4xl">
                  {item.figurita.tipo === 'jugador' ? '⚽' : '🏟️'}
                </div>

                <div className="p-3 text-center">
                  <p className="font-bold text-sm truncate">{item.figurita.nombre}</p>
                  <p className="text-xs text-gray-500">#{item.figurita.numero}</p>
                  <p className="text-xs text-gray-400 mt-1">Propietario: {item.propietario?.nombre || 'Usuario'}</p>

                  <div className="mt-3 flex gap-2 justify-center">
                    <button
                      onClick={() => { setTarget(item); setShowModal(true); setFeedback(''); }}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-95"
                    >
                      Ofertar
                    </button>
                    <Link to={`/figuritas/${item.figurita.id}`} className="text-sm px-3 py-2 rounded-lg border">Ver</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link to="/album" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition">← Volver al Álbum</Link>
        </div>
      </div>

        {/* Ofertas recibidas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-3">Ofertas recibidas</h2>
          {recibidos.length === 0 ? (
            <p className="text-gray-500">No tienes ofertas recibidas.</p>
          ) : (
            <div className="space-y-4">
              {recibidos.map((o) => (
                <div key={o.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-200 rounded flex items-center justify-center text-2xl">{o.figurita_solicitada?.tipo === 'jugador' ? '⚽' : '🏟️'}</div>
                    <div>
                      <div className="font-semibold">{o.solicitante?.nombre || 'Usuario' } quiere {o.figurita_solicitada?.nombre}</div>
                      <div className="text-xs text-gray-500">Ofrece: {o.figurita_ofrecida?.nombre || '—'}</div>
                      <div className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.estado === 'pendiente' ? (
                      <>
                        <button onClick={async () => { await handleAccion(o.id, 'aceptar'); }} className="px-3 py-1.5 bg-green-600 text-white rounded">Aceptar</button>
                        <button onClick={async () => { await handleAccion(o.id, 'rechazar'); }} className="px-3 py-1.5 bg-red-100 text-red-700 rounded">Rechazar</button>
                      </>
                    ) : (
                      <span className={`px-3 py-1.5 rounded ${o.estado === 'aceptado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{o.estado}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Modal de oferta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl">
            <h3 className="text-lg font-bold mb-3">Hacer oferta por {target?.figurita?.nombre}</h3>

            {repetidas.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-gray-600">No tienes figuritas repetidas para ofrecer.</p>
                <Link to="/album" className="inline-block mt-4 bg-primary text-white px-5 py-2 rounded-lg">Ir al álbum</Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">Selecciona una de tus repetidas para ofertar:</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {repetidas.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedOwn(f.id)}
                      className={`p-2 rounded-lg border ${selectedOwn === f.id ? 'border-green-600 ring-2 ring-green-200' : 'border-gray-200'}`}>
                      <div className="text-sm font-semibold">#{f.numero}</div>
                      <div className="text-xs text-gray-600 truncate">{f.nombre}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => { setShowModal(false); setSelectedOwn(null); }} className="px-4 py-2 rounded-lg border">Cancelar</button>
                  <button
                    onClick={async () => {
                      if (!selectedOwn) { setFeedback('Selecciona una figurita para ofertar'); return; }
                      try {
                        const payload = {
                          receptor_id: target.propietario.id || target.propietario,
                          figurita_ofrecida_id: selectedOwn,
                          figurita_solicitada_id: target.figurita.id,
                        };
                        await intercambioService.createOffer(payload);
                        setFeedback('Oferta enviada correctamente');
                        setTimeout(() => { setShowModal(false); setSelectedOwn(null); }, 900);
                      } catch (err) {
                        console.error(err);
                        setFeedback(err.response?.data?.error || 'Error al enviar la oferta');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white"
                  >Enviar oferta</button>
                </div>

                {feedback && <p className="text-sm text-center text-green-600 mt-3">{feedback}</p>}
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

