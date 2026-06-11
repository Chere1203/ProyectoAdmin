import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { figuritaService } from '../services/api';

export default function FiguriraDetailPage() {
  const { id } = useParams();
  const [figurita, setFigurita] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    figuritaService.getById(id)
      .then(res => setFigurita(res.data.figurita))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-16 text-primary">Cargando...</div>;
  if (!figurita) return <div className="text-center mt-16 text-gray-500">Figurita no encontrada.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/album" className="text-primary hover:underline text-sm mb-4 inline-block">
        ← Volver al álbum
      </Link>
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-6xl text-center mb-4">
          {figurita.tipo === 'jugador' ? '⚽' : '🏟️'}
        </div>
        <h1 className="text-3xl font-bold text-primary text-center mb-1">{figurita.nombre}</h1>
        <p className="text-center text-gray-500 mb-6">Figurita #{figurita.numero} · {figurita.pais}</p>

        <div className="grid grid-cols-2 gap-4">
          {figurita.tipo === 'jugador' && (
            <>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Posición</p>
                <p className="font-semibold text-primary">{figurita.posicion || 'N/A'}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Club</p>
                <p className="font-semibold text-primary">{figurita.club || 'N/A'}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Edad</p>
                <p className="font-semibold text-primary">{figurita.edad || 'N/A'}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Partidos mundialistas</p>
                <p className="font-semibold text-primary">{figurita.partidos_mundial || 'N/A'}</p>
              </div>
            </>
          )}
          {figurita.tipo === 'estadio' && (
            <>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Ciudad</p>
                <p className="font-semibold text-primary">{figurita.ciudad || 'N/A'}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Capacidad</p>
                <p className="font-semibold text-primary">{figurita.capacidad ? `${figurita.capacidad.toLocaleString()} espectadores` : 'N/A'}</p>
              </div>
            </>
          )}
        </div>

        {figurita.descripcion && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-700 mb-2">Descripción</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{figurita.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
