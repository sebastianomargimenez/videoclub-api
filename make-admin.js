require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeUserAdmin(email) {
  try {
    // 1. Buscar el usuario por email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error al listar usuarios:', listError);
      return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      console.error('❌ Usuario no encontrado con email:', email);
      console.log('\n📋 Usuarios disponibles:');
      users.forEach(u => console.log(`  - ${u.email} (${u.id})`));
      return;
    }

    console.log(`\n👤 Usuario encontrado: ${user.email}`);
    console.log(`📝 ID: ${user.id}`);

    // 2. Actualizar el rol a admin
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          role: 'admin',
          nombre: user.user_metadata?.nombre || 'Administrador'
        }
      }
    );

    if (error) {
      console.error('❌ Error al actualizar usuario:', error);
      return;
    }

    console.log('\n✅ Usuario actualizado a ADMIN exitosamente!');
    console.log('\n📊 Metadatos actualizados:');
    console.log(JSON.stringify(data.user.user_metadata, null, 2));
    console.log('\n🔐 El usuario ahora puede acceder a endpoints de admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Obtener email del argumento de línea de comandos
const email = process.argv[2];

if (!email) {
  console.log('❌ Debes proporcionar un email');
  console.log('\n📖 Uso:');
  console.log('  node make-admin.js usuario@ejemplo.com');
  process.exit(1);
}

makeUserAdmin(email);
