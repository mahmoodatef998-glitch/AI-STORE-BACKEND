# Database Schema Files

## 📁 Files Overview

### 1. `complete_schema.sql` ⭐ **USE THIS ONE**
**Complete and ready-to-use SQL file for Supabase SQL Editor**

This is the **main file** you should use. It contains:
- ✅ All extensions (uuid-ossp)
- ✅ All enums (equipment_type, notification_type, stock_movement_type)
- ✅ All 8 tables (equipments, equipment_consumption, notifications, predictions, orders, order_materials, stock_movements, order_attachments)
- ✅ All indexes (20+ indexes for optimal performance)
- ✅ All functions (4 functions)
- ✅ All triggers (4 triggers)
- ✅ All RLS policies (complete security setup)
- ✅ Safe execution (uses IF NOT EXISTS, DROP IF EXISTS)

### 2. `schema.sql`
Original base schema (equipments, consumption, notifications, predictions)

### 3. `orders_schema.sql`
Orders and stock movements extension (orders, order_materials, stock_movements, order_attachments)

### 4. `schema_reset.sql`
Reset script (drops and recreates everything - use with caution!)

---

## 🚀 How to Use

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Paste
1. Open `complete_schema.sql` file
2. Copy **ALL** the content (Ctrl+A, Ctrl+C)
3. Paste it into the SQL Editor

### Step 3: Run
1. Click **Run** button (or press Ctrl+Enter)
2. Wait for execution to complete
3. You should see success messages in the output

---

## 📊 Database Structure

### Tables Created:
1. **equipments** - Equipment inventory
2. **equipment_consumption** - Consumption tracking
3. **notifications** - System notifications
4. **predictions** - AI predictions
5. **orders** - Order management
6. **order_materials** - Materials in each order
7. **stock_movements** - Stock movement history
8. **order_attachments** - Receipt files

### Features:
- ✅ Automatic stock deduction on consumption/orders
- ✅ Low stock alerts via triggers
- ✅ Row Level Security (RLS) on all tables
- ✅ Automatic timestamp updates
- ✅ Optimized indexes for performance
- ✅ Foreign key constraints for data integrity

---

## ⚠️ Important Notes

1. **Safe to Run Multiple Times**: The file uses `IF NOT EXISTS` and `DROP IF EXISTS` patterns, so it's safe to run multiple times without errors.

2. **No Data Loss**: Running this file will NOT delete existing data. It only creates missing tables/objects.

3. **RLS Enabled**: All tables have Row Level Security enabled. Make sure your users have proper authentication.

4. **Triggers Active**: Stock deduction triggers are active. Make sure your backend handles errors properly.

---

## 🔧 Troubleshooting

### Error: "type already exists"
- ✅ **Fixed**: The file uses `DO $$ BEGIN ... EXCEPTION` blocks to handle this gracefully.

### Error: "table already exists"
- ✅ **Fixed**: The file uses `CREATE TABLE IF NOT EXISTS`.

### Error: "policy already exists"
- ✅ **Fixed**: The file uses `DROP POLICY IF EXISTS` before creating.

### Permission Errors
- Make sure you're running as a user with proper permissions
- Check that RLS policies allow your operations

---

## 📝 Next Steps

After running the schema:
1. ✅ Create admin user (use `create_admin_user.js`)
2. ✅ Configure environment variables
3. ✅ Start backend server
4. ✅ Start frontend server
5. ✅ Test the application

---

## 📞 Support

If you encounter any issues:
1. Check the error message in Supabase SQL Editor
2. Verify all extensions are enabled
3. Check RLS policies match your authentication setup
4. Review the logs for detailed error information

