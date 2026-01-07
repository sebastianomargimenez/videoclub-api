const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * Servicio de películas
 * Maneja la lógica de negocio para el CRUD de películas
 */
class MoviesService {
  /**
   * Obtener todas las películas
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Array} Lista de películas
   */
  async getAllMovies(options = {}) {
    try {
      let query = supabase
        .from('peliculas')
        .select('*', { count: 'exact' })
        .order('titulo', { ascending: true });

      // Filtrar por género si se proporciona
      if (options.genero) {
        query = query.ilike('genero', `%${options.genero}%`);
      }

      // Paginación
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error obteniendo películas:', error);
        throw new AppError('Error al obtener películas', 500);
      }

      return {
        movies: data || [],
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en getAllMovies:', error);
      throw new AppError('Error al obtener películas', 500);
    }
  }

  /**
   * Obtener una película por ID
   * @param {string} id - ID de la película
   * @returns {Object} Datos de la película
   */
  async getMovieById(id) {
    try {
      const { data, error } = await supabase
        .from('peliculas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new AppError('Película no encontrada', 404);
        }
        console.error('Error obteniendo película:', error);
        throw new AppError('Error al obtener película', 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en getMovieById:', error);
      throw new AppError('Error al obtener película', 500);
    }
  }

  /**
   * Crear una nueva película (solo admin)
   * @param {Object} movieData - Datos de la película
   * @returns {Object} Película creada
   */
  async createMovie(movieData) {
    try {
      const { data, error } = await supabase
        .from('peliculas')
        .insert([movieData])
        .select()
        .single();

      if (error) {
        console.error('Error creando película:', error);
        throw new AppError('Error al crear película', 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en createMovie:', error);
      throw new AppError('Error al crear película', 500);
    }
  }

  /**
   * Actualizar una película existente (solo admin)
   * @param {string} id - ID de la película
   * @param {Object} movieData - Datos actualizados
   * @returns {Object} Película actualizada
   */
  async updateMovie(id, movieData) {
    try {
      // Verificar que la película existe
      await this.getMovieById(id);

      const { data, error } = await supabase
        .from('peliculas')
        .update(movieData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando película:', error);
        throw new AppError('Error al actualizar película', 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en updateMovie:', error);
      throw new AppError('Error al actualizar película', 500);
    }
  }

  /**
   * Eliminar una película (solo admin)
   * @param {string} id - ID de la película
   * @returns {Object} Mensaje de confirmación
   */
  async deleteMovie(id) {
    try {
      // Verificar que la película existe
      await this.getMovieById(id);

      // Verificar que no tiene alquileres activos
      const { data: activeRentals } = await supabase
        .from('alquileres')
        .select('id')
        .eq('pelicula_id', id)
        .eq('devuelto', false);

      if (activeRentals && activeRentals.length > 0) {
        throw new AppError(
          'No se puede eliminar una película con alquileres activos',
          400
        );
      }

      const { error } = await supabase
        .from('peliculas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando película:', error);
        throw new AppError('Error al eliminar película', 500);
      }

      return { message: 'Película eliminada exitosamente' };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en deleteMovie:', error);
      throw new AppError('Error al eliminar película', 500);
    }
  }
}

module.exports = new MoviesService();
