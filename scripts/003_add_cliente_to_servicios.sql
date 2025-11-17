-- Agregar cliente_id a la tabla servicios para mantener el historial del cliente que pagó
ALTER TABLE servicios
ADD COLUMN cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;

-- Actualizar los registros existentes para copiar el cliente_id del vehículo
UPDATE servicios s
SET cliente_id = v.cliente_id
FROM vehiculos v
WHERE s.vehiculo_id = v.id;

-- Crear índice para mejorar las consultas por cliente
CREATE INDEX idx_servicios_cliente_id ON servicios(cliente_id);

-- Comentario explicativo
COMMENT ON COLUMN servicios.cliente_id IS 'Cliente que pagó por el servicio (no cambia si el vehículo cambia de dueño)';
