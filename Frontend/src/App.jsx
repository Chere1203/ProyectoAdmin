import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AlbumPage from './pages/AlbumPage';
import FiguriraDetailPage from './pages/FiguriraDetailPage';
import IntercambioPage from './pages/IntercambioPages';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const location = useLocation();

  const authPages =
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <div className="min-h-screen">
      {!authPages && <Navbar />}

      {authPages ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/album"
              element={
                <PrivateRoute>
                  <AlbumPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/figuritas/:id"
              element={
                <PrivateRoute>
                  <FiguriraDetailPage />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/album" replace />} />

              <Route
                path="/intercambio"
                element={
                  <PrivateRoute>
                    <IntercambioPage />
                  </PrivateRoute>
                }
              />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default App;