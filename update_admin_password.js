// Script to update admin user password in Supabase
// Run with: node update_admin_password.js

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

async function updateAdminPassword() {
  const email = 'admin@example.com';
  const password = '00243540000';

  console.log('');
  console.log('🔄 Updating admin user password...');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('');

  try {
    // List all users
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      throw listError;
    }

    // Find user by email
    const user = usersData?.users?.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('Available users:');
      usersData?.users?.forEach(u => {
        console.log(`  - ${u.email} (${u.id})`);
      });
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Email Confirmed: ${user.email_confirmed_at ? '✅ true' : '❌ false'}`);
    console.log('');

    // Update password
    console.log('🔄 Updating password...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: password,
        user_metadata: {
          username: 'admin',
          role: 'admin',
        },
      }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError.message);
      throw updateError;
    }

    console.log('✅ Password updated successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log(`   Username: admin`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminPassword();

