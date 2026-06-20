-- ══════════════════════════════════════════
-- Schema de base de datos — AlbumVirtual FIFA
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════

-- ── Tabla de usuarios ──
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Catálogo de figuritas ──
-- tipo: 'jugador' | 'estadio' | 'sede'
CREATE TABLE IF NOT EXISTS figuritas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('jugador', 'estadio', 'sede')),
  pais VARCHAR(100),
  -- Campos para jugadores
  posicion VARCHAR(50),
  club VARCHAR(100),
  edad INTEGER,
  partidos_mundial INTEGER DEFAULT 0,
  -- Campos para estadios/sedes
  ciudad VARCHAR(100),
  capacidad INTEGER,
  -- Común
  descripcion TEXT,
  imagen_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Álbum personal del usuario ──
-- estado: 'obtenida' | 'repetida' | 'no_tengo'
CREATE TABLE IF NOT EXISTS album_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  figurita_id UUID NOT NULL REFERENCES figuritas(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'no_tengo'
    CHECK (estado IN ('obtenida', 'repetida', 'no_tengo')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, figurita_id)
);

-- ── Intercambios ── (Sprint 3)
CREATE TABLE IF NOT EXISTS intercambios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante_id UUID NOT NULL REFERENCES usuarios(id),
  receptor_id UUID NOT NULL REFERENCES usuarios(id),
  figurita_ofrecida_id UUID NOT NULL REFERENCES figuritas(id),
  figurita_solicitada_id UUID NOT NULL REFERENCES figuritas(id),
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aceptado', 'rechazado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════
-- Datos de prueba (Mock Data para el MVP)
-- ══════════════════════════════════════════

INSERT INTO figuritas (numero, nombre, tipo, pais, posicion, club, edad, partidos_mundial, descripcion) VALUES
(1,  'Lionel Messi',     'jugador', 'Argentina', 'Delantero', 'Inter Miami', 36, 26, 'Mejor jugador de la historia según muchos expertos. Campeón del mundo con Argentina en 2022.'),
(2,  'Cristiano Ronaldo','jugador', 'Portugal',  'Delantero', 'Al Nassr',    38, 22, 'Uno de los mayores goleadores de la historia del fútbol mundial.'),
(3,  'Kylian Mbappé',    'jugador', 'Francia',   'Delantero', 'Real Madrid', 25, 14, 'El jugador más rápido del mundo. Campeón del mundo con Francia en 2018.'),
(4,  'Erling Haaland',   'jugador', 'Noruega',   'Delantero', 'Man City',    23, 0,  'Máximo goleador de la Premier League. Debuta en un Mundial en 2026.'),
(5,  'Vinicius Jr',      'jugador', 'Brasil',    'Delantero', 'Real Madrid', 24, 8,  'El jugador más desequilibrante del mundo. Clave para Brasil en el Mundial 2026.'),
(6,  'Rodri',            'jugador', 'España',    'Mediocampista', 'Man City', 29, 6, 'Balón de Oro 2024. El mejor mediocampista del mundo.'),
(7,  'Pedri',            'jugador', 'España',    'Mediocampista', 'Barcelona', 23, 4, 'El centrocampista más talentoso de su generación.'),
(8,  'Jude Bellingham',  'jugador', 'Inglaterra','Mediocampista', 'Real Madrid', 20, 6, 'El jugador más completo de su generación. Líder de Inglaterra.'),
(9,  'Gianluigi Donnarumma', 'jugador', 'Italia', 'Portero', 'PSG', 25, 6, 'Mejor portero del mundo. Ganó la EURO 2020 con Italia.'),
(10, 'Alphonso Davies', 'jugador', 'Canadá',     'Defensa',  'Bayern Munich', 23, 3, 'El lateral más rápido del mundo. Ícono del fútbol canadiense.'),
(11, 'SoFi Stadium',     'estadio', 'Estados Unidos', NULL, NULL, NULL, NULL, 'Sede de la final del Mundial 2026. Capacidad para 70,000 espectadores en Los Ángeles, California.'),
(12, 'Estadio Azteca',   'estadio', 'México',    NULL, NULL, NULL, NULL, 'El estadio con más historia en los mundiales. Ha sido sede en 1970 y 1986.'),
(13, 'BC Place',         'estadio', 'Canadá',    NULL, NULL, NULL, NULL, 'Estadio techado en Vancouver. Sede de partidos de la Copa del Mundo 2026.'),
(14, 'Lamine Yamal',     'jugador', 'España',    'Delantero', 'Barcelona', 17, 2, 'La gran promesa del fútbol mundial. Campeón de la EURO 2024 con solo 17 años.'),
(15, 'Florian Wirtz',    'jugador', 'Alemania',  'Mediocampista', 'Bayern Munich', 21, 3, 'El mejor jugador joven de la Bundesliga. El futuro de Alemania.')
ON CONFLICT (numero) DO NOTHING;
