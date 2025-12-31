// Script to check and create admin user in Supabase
// Run with: node check_and_create_admin.js

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

async function checkAndCreateAdmin() {
  const username = 'admin';
  const password = '00243540000';
  const email = `${username}@local`; // Format: admin@local
  const phoneEmail = `${password}@phone.local`; // Format: 00243540000@phone.local

  console.log('🔍 Checking for admin user...');
  console.log(`Username: ${username}`);
  console.log(`Email format: ${email}`);
  console.log(`Phone format: ${phoneEmail}`);
  console.log(`Password: ${password}`);
  console.log('');

  try {
    // List all users
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      throw listError;
    }

    console.log(`📊 Total users found: ${usersData?.users?.length || 0}`);
    console.log('');

    // Check if user exists with email format
    const existingUserByEmail = usersData?.users?.find(
      (u) => u.email === email || u.email === phoneEmail
    );

    // Check if user exists with username in metadata
    const existingUserByUsername = usersData?.users?.find(
      (u) => u.user_metadata?.username === username
    );

    const existingUser = existingUserByEmail || existingUserByUsername;

    if (existingUser) {
      console.log('✅ User found!');
      console.log(`User ID: ${existingUser.id}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Username: ${existingUser.user_metadata?.username || 'N/A'}`);
      console.log(`Role: ${existingUser.user_metadata?.role || 'N/A'}`);
      console.log('');

      // Update password to ensure it's correct
      console.log('🔄 Updating password...');
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          user_metadata: {
            username: username,
            role: 'admin',
          },
        }
      );

      if (updateError) {
        console.error('❌ Error updating user:', updateError.message);
        throw updateError;
      }

      console.log('✅ Password updated successfully!');
      console.log('');
      console.log('📋 Login Credentials:');
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log(`   Email: ${email}`);
      console.log(`   Phone: ${phoneEmail}`);
      console.log('');
      return;
    }

    // User doesn't exist, create it
    console.log('⚠️  User not found. Creating new admin user...');
    console.log('');

    // Try creating with email format first
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
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
    console.log(`   Password: ${password}`);
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phoneEmail}`);
    console.log('');
    console.log('🔗 You can now login at:');
    console.log('   Development: http://localhost:3000/login');
    console.log('   Production: https://your-app.vercel.app/login');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

checkAndCreateAdmin();

