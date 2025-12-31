// Script to create admin user in Supabase
// Run with: node create_admin_user.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure BACKEND/.env file exists with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const username = 'admin';
  const password = '00243540000';
  const email = `${username}@local`; // Format: admin@local

  console.log('🚀 Creating admin user...');
  console.log(`Username: ${username}`);
  console.log(`Email format: ${email}`);
  console.log(`Password: ${password}`);
  console.log('');

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === email || u.user_metadata?.username === username
    );

    if (existingUser) {
      console.log('⚠️  User already exists! Updating...');
      
      // Update existing user
      const { data, error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          user_metadata: {
            username: username,
            role: 'admin',
          },
        }
      );

      if (error) throw error;
      console.log('✅ User updated successfully!');
      console.log(`User ID: ${data.user.id}`);
      return;
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: username,
        role: 'admin',
      },
    });

    if (error) throw error;

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('🔗 You can now login at: http://localhost:3000');
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
}

createAdminUser();

