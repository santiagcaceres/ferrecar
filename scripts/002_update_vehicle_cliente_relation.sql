-- Modificar la tabla vehiculos para que al eliminar un cliente NO se eliminen sus vehículos
-- Los vehículos son independientes y pueden cambiar de dueño

-- Primero eliminamos la restricción anterior
ALTER TABLE vehiculos DROP CONSTRAINT IF EXISTS vehiculos_cliente_id_fkey;

-- Agregamos la nueva restricción sin ON DELETE CASCADE
-- Esto permitirá que los vehículos persistan aunque se elimine el cliente
ALTER TABLE vehiculos 
ADD CONSTRAINT vehiculos_cliente_id_fkey 
FOREIGN KEY (cliente_id) 
REFERENCES clientes(id) 
ON DELETE SET NULL;

-- Hacemos que cliente_id sea nullable
ALTER TABLE vehiculos ALTER COLUMN cliente_id DROP NOT NULL;
