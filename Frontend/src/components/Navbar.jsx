import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wide">
          🎴 AlbumVirtual FIFA
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/album" className="hover:text-accent transition-colors">
                Mi Álbum
              </Link>
              <span className="text-sm opacity-75">Hola, {user?.nombre}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-primary px-3 py-1 rounded text-sm font-medium hover:bg-accent hover:text-white transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent transition-colors">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-accent text-white px-3 py-1 rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
