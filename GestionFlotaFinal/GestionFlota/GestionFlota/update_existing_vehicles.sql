-- Script para actualizar la fecha de registro de vehículos existentes
-- Ejecuta este script en tu base de datos PostgreSQL

-- Actualiza todos los vehículos que no tienen fecha de registro
-- Les asigna la fecha y hora actual
UPDATE vehicles 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Verifica cuántos vehículos fueron actualizados
SELECT COUNT(*) as vehiculos_actualizados 
FROM vehicles 
WHERE created_at IS NOT NULL;

-- Muestra todos los vehículos con sus fechas
SELECT 
    id,
    license_plate,
    brand,
    model,
    created_at as fecha_registro
FROM vehicles
ORDER BY id;
