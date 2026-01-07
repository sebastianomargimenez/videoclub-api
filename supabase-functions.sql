-- ============================================================
-- FUNCIONES POSTGRESQL PARA VIDEOCLUB API
-- ============================================================
-- Estas funciones garantizan transacciones atómicas para el
-- manejo de stock y alquileres
-- ============================================================

-- ============================================================
-- FUNCIÓN 1: crear_alquiler
-- ============================================================
-- Crea un alquiler y reduce el stock automáticamente
-- Incluye validaciones de negocio:
-- - Límite de 3 películas activas por usuario
-- - Stock disponible > 0
-- - Bloqueo de fila para evitar race conditions
-- ============================================================

CREATE OR REPLACE FUNCTION crear_alquiler(
  p_user_id UUID,
  p_movie_id UUID
)
RETURNS TABLE(
  id UUID,
  perfil_id UUID,
  pelicula_id UUID,
  devuelto BOOLEAN,
  fecha_alquiler TIMESTAMPTZ
) AS $$
DECLARE
  v_stock INT;
  v_active_count INT;
BEGIN
  -- 1. Verificar límite de 3 películas activas
  SELECT COUNT(*) INTO v_active_count
  FROM alquileres
  WHERE perfil_id = p_user_id AND devuelto = false;

  IF v_active_count >= 3 THEN
    RAISE EXCEPTION 'Límite de 3 películas activas alcanzado';
  END IF;

  -- 2. Verificar y bloquear fila de película (evita race conditions)
  SELECT stock_disponible INTO v_stock
  FROM peliculas
  WHERE id = p_movie_id
  FOR UPDATE;

  IF v_stock IS NULL THEN
    RAISE EXCEPTION 'Película no encontrada';
  END IF;

  IF v_stock <= 0 THEN
    RAISE EXCEPTION 'Sin stock disponible';
  END IF;

  -- 3. Reducir stock
  UPDATE peliculas
  SET stock_disponible = stock_disponible - 1
  WHERE id = p_movie_id;

  -- 4. Crear alquiler
  RETURN QUERY
  INSERT INTO alquileres (perfil_id, pelicula_id, devuelto, fecha_alquiler)
  VALUES (p_user_id, p_movie_id, false, NOW())
  RETURNING alquileres.id, alquileres.perfil_id, alquileres.pelicula_id,
            alquileres.devuelto, alquileres.fecha_alquiler;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN 2: devolver_alquiler
-- ============================================================
-- Marca un alquiler como devuelto y restaura el stock
-- Incluye validaciones:
-- - El alquiler existe y no está devuelto
-- - Bloqueo de filas para atomicidad
-- ============================================================

CREATE OR REPLACE FUNCTION devolver_alquiler(p_rental_id UUID)
RETURNS VOID AS $$
DECLARE
  v_movie_id UUID;
  v_user_id UUID;
BEGIN
  -- 1. Obtener película y usuario, y bloquear fila
  SELECT pelicula_id, perfil_id INTO v_movie_id, v_user_id
  FROM alquileres
  WHERE id = p_rental_id AND devuelto = false
  FOR UPDATE;

  IF v_movie_id IS NULL THEN
    RAISE EXCEPTION 'Alquiler no encontrado o ya devuelto';
  END IF;

  -- 2. Actualizar alquiler como devuelto
  UPDATE alquileres
  SET devuelto = true
  WHERE id = p_rental_id;

  -- 3. Restaurar stock
  UPDATE peliculas
  SET stock_disponible = stock_disponible + 1
  WHERE id = v_movie_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VERIFICACIÓN DE LAS FUNCIONES
-- ============================================================
-- Puedes ejecutar estas queries para verificar que las
-- funciones se crearon correctamente:
-- ============================================================

-- Ver funciones creadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('crear_alquiler', 'devolver_alquiler');

-- ============================================================
-- EJEMPLOS DE USO (para testing manual)
-- ============================================================
-- NOTA: Reemplaza los UUIDs con valores reales de tu DB

-- Ejemplo 1: Crear un alquiler
-- SELECT * FROM crear_alquiler(
--   'uuid-del-usuario'::uuid,
--   'uuid-de-la-pelicula'::uuid
-- );

-- Ejemplo 2: Devolver un alquiler
-- SELECT devolver_alquiler('uuid-del-alquiler'::uuid);

-- Ejemplo 3: Ver alquileres activos de un usuario
-- SELECT * FROM alquileres
-- WHERE perfil_id = 'uuid-del-usuario'::uuid
-- AND devuelto = false;

-- Ejemplo 4: Ver stock de películas
-- SELECT id, titulo, stock_total, stock_disponible
-- FROM peliculas;
