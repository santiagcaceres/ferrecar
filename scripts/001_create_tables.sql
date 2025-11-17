-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula TEXT NOT NULL UNIQUE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  color TEXT,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  kilometraje INTEGER NOT NULL,
  servicios_realizados TEXT[] NOT NULL,
  tipo_aceite TEXT,
  proximo_cambio_aceite INTEGER,
  mecanico TEXT NOT NULL,
  observaciones TEXT,
  costo DECIMAL(10, 2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'En Proceso',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_vehiculos_cliente ON vehiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_matricula ON vehiculos(matricula);
CREATE INDEX IF NOT EXISTS idx_servicios_vehiculo ON servicios(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_servicios_fecha ON servicios(fecha);
CREATE INDEX IF NOT EXISTS idx_servicios_estado ON servicios(estado);
