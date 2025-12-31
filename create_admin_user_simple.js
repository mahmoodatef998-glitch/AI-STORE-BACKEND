// Professional script to create/update admin user in Supabase
// Run with: node create_admin_user_simple.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('');
  console.error('❌ Missing Supabase environment variables');
  console.error('');
  console.error('Make sure BACKEND/.env file exists with:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createOrUpdateAdminUser() {
  const username = 'admin';
  const password = '00243540000';
  const email = 'admin@example.com';

  console.log('');
  console.log('🚀 Creating/Updating admin user...');
  console.log('');
  console.log('📋 User Details:');
  console.log(`   Username: ${username}`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('');

  try {
    // First, check if user already exists
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      throw listError;
    }

    const existingUser = usersData?.users?.find(u => u.email === email);

    if (existingUser) {
      console.log('ℹ️  User already exists, updating...');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Email Confirmed: ${existingUser.email_confirmed_at ? '✅ true' : '❌ false'}`);
      console.log('');

      // Update existing user
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          email_confirm: true, // Ensure email is confirmed
          user_metadata: {
            username: username,
            role: 'admin',
          },
        }
      );

      if (updateError) {
        console.error('❌ Error updating user:', updateError.message);
        console.error('Full error:', updateError);
        throw updateError;
      }

      console.log('✅ Admin user updated successfully!');
      console.log('');
      console.log('📋 Updated Login Credentials:');
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('');

    } else {
      console.log('ℹ️  User does not exist, creating new user...');
      console.log('');

      // Create new user
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm email (CRITICAL!)
        user_metadata: {
          username: username,
          role: 'admin',
        },
      });

      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        console.error('Full error:', createError);
        throw createError;
      }

      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('📋 Login Credentials:');
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('');
    }

    // Verify the user was created/updated correctly
    console.log('🔍 Verifying user...');
    const { data: verifyData, error: verifyError } = await supabase.auth.admin.listUsers();
    
    if (verifyError) {
      console.warn('⚠️  Could not verify user:', verifyError.message);
    } else {
      const verifiedUser = verifyData?.users?.find(u => u.email === email);
      if (verifiedUser) {
        console.log('✅ User verified successfully!');
        console.log(`   User ID: ${verifiedUser.id}`);
        console.log(`   Email: ${verifiedUser.email}`);
        console.log(`   Email Confirmed: ${verifiedUser.email_confirmed_at ? '✅ true' : '❌ false'}`);
        console.log(`   Role: ${verifiedUser.user_metadata?.role || 'not set'}`);
        console.log('');
      } else {
        console.warn('⚠️  User not found after creation/update');
      }
    }

    console.log('🔗 You can now login at:');
    console.log('   Development: http://localhost:3000/login');
    console.log('   Production: https://ai-store-frontend.vercel.app/login');
    console.log('');
    console.log('📝 Login Instructions:');
    console.log('   1. Enter username: "admin" (or email: "admin@example.com")');
    console.log('   2. Enter password: "00243540000"');
    console.log('   3. Click "Sign In"');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.error('');
    process.exit(1);
  }
}

// Run the function
createOrUpdateAdminUser();
