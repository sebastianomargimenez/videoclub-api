require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Películas de ejemplo con todos los campos
const peliculasCompletas = [
  {
    titulo: 'Matrix',
    genero: 'Ciencia Ficción',
    stock_total: 3,
    stock_disponible: 3,
    precio_alquiler: 3.99,
    poster_url: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    director: 'Lana Wachowski, Lilly Wachowski',
    anio: 1999,
    duracion: 136,
    descripcion: 'Un programador descubre que la realidad que conoce es una simulación creada por máquinas inteligentes.'
  },
  {
    titulo: 'Inception',
    genero: 'Thriller',
    stock_total: 2,
    stock_disponible: 2,
    precio_alquiler: 4.50,
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    director: 'Christopher Nolan',
    anio: 2010,
    duracion: 148,
    descripcion: 'Un ladrón especializado en robar secretos corporativos a través de los sueños recibe la tarea inversa: plantar una idea en la mente de alguien.'
  },
  {
    titulo: 'Interstellar',
    genero: 'Ciencia Ficción',
    stock_total: 1,
    stock_disponible: 1,
    precio_alquiler: 4.99,
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    director: 'Christopher Nolan',
    anio: 2014,
    duracion: 169,
    descripcion: 'Un grupo de exploradores viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.'
  },
  {
    titulo: 'The Dark Knight',
    genero: 'Acción',
    stock_total: 2,
    stock_disponible: 2,
    precio_alquiler: 3.50,
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    director: 'Christopher Nolan',
    anio: 2008,
    duracion: 152,
    descripcion: 'Batman enfrenta al Joker, un genio criminal que quiere sumir Ciudad Gótica en el caos.'
  },
  {
    titulo: 'Pulp Fiction',
    genero: 'Drama',
    stock_total: 3,
    stock_disponible: 3,
    precio_alquiler: 3.99,
    poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    director: 'Quentin Tarantino',
    anio: 1994,
    duracion: 154,
    descripcion: 'Historias entrelazadas de crimen en Los Ángeles, contadas de forma no lineal.'
  },
  {
    titulo: 'El Padrino',
    genero: 'Drama',
    stock_total: 2,
    stock_disponible: 2,
    precio_alquiler: 4.50,
    poster_url: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    director: 'Francis Ford Coppola',
    anio: 1972,
    duracion: 175,
    descripcion: 'La historia de la familia Corleone, una de las dinastías criminales más poderosas de Nueva York.'
  },
  {
    titulo: 'Forrest Gump',
    genero: 'Drama',
    stock_total: 2,
    stock_disponible: 2,
    precio_alquiler: 3.50,
    poster_url: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    director: 'Robert Zemeckis',
    anio: 1994,
    duracion: 142,
    descripcion: 'Un hombre con discapacidad intelectual vive momentos extraordinarios de la historia americana.'
  },
  {
    titulo: 'Parasite',
    genero: 'Thriller',
    stock_total: 1,
    stock_disponible: 1,
    precio_alquiler: 4.99,
    poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    director: 'Bong Joon-ho',
    anio: 2019,
    duracion: 132,
    descripcion: 'Una familia pobre se infiltra en la vida de una familia rica con consecuencias impredecibles.'
  }
];

async function populateMovies() {
  console.log('🎬 Iniciando actualización de películas...\n');

  try {
    // Opción 1: Actualizar películas existentes por título
    for (const pelicula of peliculasCompletas) {
      const { data: existing } = await supabase
        .from('peliculas')
        .select('id, titulo')
        .eq('titulo', pelicula.titulo)
        .maybeSingle();

      if (existing) {
        // Actualizar película existente
        const { error } = await supabase
          .from('peliculas')
          .update(pelicula)
          .eq('id', existing.id);

        if (error) {
          console.error(`❌ Error actualizando "${pelicula.titulo}":`, error.message);
        } else {
          console.log(`✅ Actualizada: ${pelicula.titulo}`);
        }
      } else {
        // Crear película nueva
        const { error } = await supabase
          .from('peliculas')
          .insert([pelicula]);

        if (error) {
          console.error(`❌ Error creando "${pelicula.titulo}":`, error.message);
        } else {
          console.log(`✨ Creada: ${pelicula.titulo}`);
        }
      }
    }

    console.log('\n🎉 ¡Películas actualizadas exitosamente!\n');

    // Mostrar resumen
    const { data: allMovies } = await supabase
      .from('peliculas')
      .select('titulo, genero, anio, director, poster_url')
      .order('titulo');

    console.log('📋 Películas en la base de datos:\n');
    allMovies.forEach(movie => {
      console.log(`  🎥 ${movie.titulo} (${movie.anio || 'N/A'})`);
      console.log(`     Director: ${movie.director || 'N/A'}`);
      console.log(`     Género: ${movie.genero}`);
      console.log(`     Poster: ${movie.poster_url ? '✓' : '✗'}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

populateMovies();
