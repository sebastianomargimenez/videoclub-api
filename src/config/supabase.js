const { createClient } = require('@supabase/supabase-js');

// Validar que las variables de entorno existan
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  console.error('Por favor configura estas variables en tu archivo .env');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Crear cliente de Supabase con Service Role Key
// Esta clave tiene privilegios administrativos y se usa SOLO en el backend
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Cliente de Supabase configurado correctamente');

module.exports = supabase;
