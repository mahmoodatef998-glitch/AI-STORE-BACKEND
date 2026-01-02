// Script to delete existing admin user and recreate it
// Use this if you want to completely reset the admin user
// Run with: node delete_and_recreate_admin.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function deleteAndRecreateAdmin() {
  const username = 'admin';
  const password = '00243540000';
  const email = 'admin@example.com';

  console.log('');
  console.log('🔄 Deleting and recreating admin user...');
  console.log('');

  try {
    // List all users
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      throw listError;
    }

    // Find existing admin user
    const existingUser = usersData?.users?.find(u => u.email === email);

    if (existingUser) {
      console.log('🗑️  Deleting existing user...');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log('');

      // Delete existing user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);

      if (deleteError) {
        console.error('❌ Error deleting user:', deleteError.message);
        throw deleteError;
      }

      console.log('✅ User deleted successfully!');
      console.log('');

      // Wait a moment before recreating
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log('ℹ️  No existing user found, will create new one...');
      console.log('');
    }

    // Create new user
    console.log('🚀 Creating new admin user...');
    console.log('📋 User Details:');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');

    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
        role: 'admin',
      },
    });

    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      throw createError;
    }

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAndRecreateAdmin();


