const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../config/constants');

/**
 * Servicio de alquileres
 * Maneja la lógica de negocio para alquilar y devolver películas
 * Utiliza funciones RPC de PostgreSQL para garantizar atomicidad
 */
class RentalsService {
  /**
   * Crear un nuevo alquiler
   * @param {string} userId - ID del usuario
   * @param {string} movieId - ID de la película
   * @returns {Object} Datos del alquiler creado
   */
  async createRental(userId, movieId) {
    try {
      // 1. Verificar que el usuario no tenga ya esta película alquilada
      const { data: existing, error: checkError } = await supabase
        .from('alquileres')
        .select('id')
        .eq('perfil_id', userId)
        .eq('pelicula_id', movieId)
        .eq('devuelto', false)
        .maybeSingle();

      if (checkError) {
        console.error('Error verificando alquiler existente:', checkError);
        throw new AppError('Error al verificar alquileres', 500);
      }

      if (existing) {
        throw new AppError(ERROR_MESSAGES.ALREADY_RENTED, 400);
      }

      // 2. Llamar a la función RPC que maneja todo atómicamente
      // Esta función verifica límite de 3 películas y stock disponible
      const { data, error } = await supabase.rpc('crear_alquiler', {
        p_user_id: userId,
        p_movie_id: movieId
      });

      console.log('RPC Response - data:', data);
      console.log('RPC Response - error:', error);

      if (error) {
        console.error('Error en RPC crear_alquiler:', error);
        // Mensajes de error específicos de la función PostgreSQL
        if (error.message && error.message.includes('Límite de 3 películas')) {
          throw new AppError(ERROR_MESSAGES.MAX_RENTALS_REACHED, 400);
        }
        if (error.message && error.message.includes('Sin stock disponible')) {
          throw new AppError(ERROR_MESSAGES.NO_STOCK_AVAILABLE, 400);
        }
        if (error.message && error.message.includes('Película no encontrada')) {
          throw new AppError('Película no encontrada', 404);
        }
        throw new AppError(`Error al crear alquiler: ${error.message || JSON.stringify(error)}`, 500);
      }

      if (!data) {
        throw new AppError('No se pudo crear el alquiler - sin datos', 500);
      }

      // La función RPC puede devolver un array o un objeto único
      const rentalData = Array.isArray(data) ? data[0] : data;

      // 3. Obtener información completa de la película para la respuesta
      const { data: movie } = await supabase
        .from('peliculas')
        .select('id, titulo, genero, precio_alquiler')
        .eq('id', movieId)
        .single();

      return {
        alquiler: rentalData,
        pelicula: movie
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en createRental:', error);
      throw new AppError('Error al crear alquiler', 500);
    }
  }

  /**
   * Devolver una película alquilada
   * @param {string} rentalId - ID del alquiler
   * @param {string} userId - ID del usuario (para verificar ownership)
   * @returns {Object} Mensaje de confirmación
   */
  async returnRental(rentalId, userId) {
    try {
      // 1. Verificar que el alquiler existe y pertenece al usuario
      const { data: rental, error: checkError } = await supabase
        .from('alquileres')
        .select('id, pelicula_id, devuelto')
        .eq('id', rentalId)
        .eq('perfil_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error verificando alquiler:', checkError);
        throw new AppError('Error al verificar alquiler', 500);
      }

      if (!rental) {
        throw new AppError('Alquiler no encontrado', 404);
      }

      if (rental.devuelto) {
        throw new AppError('Esta película ya fue devuelta', 400);
      }

      // 2. Llamar a la función RPC que maneja la devolución atómicamente
      const { error } = await supabase.rpc('devolver_alquiler', {
        p_rental_id: rentalId
      });

      if (error) {
        console.error('Error en RPC devolver_alquiler:', error);
        if (error.message.includes('no encontrado o ya devuelto')) {
          throw new AppError(ERROR_MESSAGES.RENTAL_NOT_FOUND, 404);
        }
        throw new AppError('Error al devolver película', 500);
      }

      return {
        message: 'Película devuelta exitosamente',
        alquiler_id: rentalId
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en returnRental:', error);
      throw new AppError('Error al devolver película', 500);
    }
  }

  /**
   * Obtener alquileres activos de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Array} Lista de alquileres activos
   */
  async getUserActiveRentals(userId) {
    try {
      const { data, error } = await supabase
        .from('alquileres')
        .select(`
          id,
          fecha_alquiler,
          fecha_devolucion_prevista,
          devuelto,
          peliculas:pelicula_id (
            id,
            titulo,
            genero,
            precio_alquiler
          )
        `)
        .eq('perfil_id', userId)
        .eq('devuelto', false)
        .order('fecha_alquiler', { ascending: false });

      if (error) {
        console.error('Error obteniendo alquileres activos:', error);
        throw new AppError('Error al obtener alquileres', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en getUserActiveRentals:', error);
      throw new AppError('Error al obtener alquileres', 500);
    }
  }

  /**
   * Obtener historial completo de alquileres de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Array} Historial de alquileres
   */
  async getUserRentalHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('alquileres')
        .select(`
          id,
          fecha_alquiler,
          fecha_devolucion_prevista,
          devuelto,
          peliculas:pelicula_id (
            id,
            titulo,
            genero,
            precio_alquiler
          )
        `)
        .eq('perfil_id', userId)
        .order('fecha_alquiler', { ascending: false });

      if (error) {
        console.error('Error obteniendo historial:', error);
        throw new AppError('Error al obtener historial', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en getUserRentalHistory:', error);
      throw new AppError('Error al obtener historial', 500);
    }
  }

  /**
   * Obtener todos los alquileres (solo admin)
   * @returns {Array} Lista de todos los alquileres
   */
  async getAllRentals() {
    try {
      const { data, error } = await supabase
        .from('alquileres')
        .select(`
          id,
          fecha_alquiler,
          fecha_devolucion_prevista,
          devuelto,
          perfil_id,
          peliculas:pelicula_id (
            id,
            titulo,
            genero
          )
        `)
        .order('fecha_alquiler', { ascending: false });

      if (error) {
        console.error('Error obteniendo todos los alquileres:', error);
        throw new AppError('Error al obtener alquileres', 500);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error inesperado en getAllRentals:', error);
      throw new AppError('Error al obtener alquileres', 500);
    }
  }
}

module.exports = new RentalsService();
