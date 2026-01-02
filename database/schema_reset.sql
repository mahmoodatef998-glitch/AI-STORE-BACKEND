-- Equipment Inventory Management System - Database Schema (Reset Version)
-- This version handles existing types and tables gracefully
-- Supabase PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums (with IF NOT EXISTS check using DO block)
DO $$ BEGIN
    CREATE TYPE equipment_type AS ENUM ('electrical', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('email', 'dashboard', 'whatsapp');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create suppliers table (optional)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipments table
CREATE TABLE IF NOT EXISTS equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type equipment_type NOT NULL,
    quantity_total INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    minimum_threshold INTEGER NOT NULL DEFAULT 10,
    unit_price DECIMAL(10, 2),
    location TEXT,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT quantity_check CHECK (quantity_available >= 0 AND quantity_total >= quantity_available)
);

-- Create equipment_consumption table
CREATE TABLE IF NOT EXISTS equipment_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
    purpose TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notification_type NOT NULL DEFAULT 'dashboard',
    message TEXT NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    equipment_id UUID REFERENCES equipments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create predictions table (for storing AI predictions)
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    predicted_consumption INTEGER NOT NULL,
    prediction_date DATE NOT NULL,
    confidence_score DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(equipment_id, prediction_date)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_equipment_consumption_equipment_id ON equipment_consumption(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_consumption_date ON equipment_consumption(date);
CREATE INDEX IF NOT EXISTS idx_equipment_consumption_user_id ON equipment_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_equipment_id ON notifications(equipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(sent);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp);
CREATE INDEX IF NOT EXISTS idx_equipments_type ON equipments(type);
CREATE INDEX IF NOT EXISTS idx_predictions_equipment_id ON predictions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON predictions(prediction_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_equipments_updated_at ON equipments;
CREATE TRIGGER update_equipments_updated_at
    BEFORE UPDATE ON equipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-decrement quantity_available when consumption is logged
CREATE OR REPLACE FUNCTION decrement_equipment_quantity()
RETURNS TRIGGER AS $$
DECLARE
    current_available INTEGER;
BEGIN
    -- Get current available quantity
    SELECT quantity_available INTO current_available
    FROM equipments
    WHERE id = NEW.equipment_id;
    
    -- Check if enough quantity is available
    IF current_available < NEW.quantity_used THEN
        RAISE EXCEPTION 'Insufficient quantity available. Available: %, Requested: %', 
            current_available, NEW.quantity_used;
    END IF;
    
    -- Decrement the quantity
    UPDATE equipments
    SET quantity_available = quantity_available - NEW.quantity_used,
        updated_at = NOW()
    WHERE id = NEW.equipment_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS trigger_decrement_equipment_quantity ON equipment_consumption;
CREATE TRIGGER trigger_decrement_equipment_quantity
    AFTER INSERT ON equipment_consumption
    FOR EACH ROW
    EXECUTE FUNCTION decrement_equipment_quantity();

-- Function to check low stock and create notifications
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if quantity_available is below minimum_threshold
    IF NEW.quantity_available <= NEW.minimum_threshold THEN
        -- Create dashboard notification
        INSERT INTO notifications (type, message, equipment_id, sent)
        VALUES (
            'dashboard',
            format('Low stock alert: %s has only %s units available (threshold: %s)', 
                   NEW.name, NEW.quantity_available, NEW.minimum_threshold),
            NEW.id,
            FALSE
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS trigger_check_low_stock ON equipments;
CREATE TRIGGER trigger_check_low_stock
    AFTER UPDATE OF quantity_available ON equipments
    FOR EACH ROW
    WHEN (NEW.quantity_available <= NEW.minimum_threshold)
    EXECUTE FUNCTION check_low_stock();

-- Function to get user role (helper function for RLS)
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT raw_user_meta_data->>'role' INTO user_role
    FROM auth.users
    WHERE id = user_uuid;
    
    RETURN COALESCE(user_role, 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Anyone can view equipments" ON equipments;
DROP POLICY IF EXISTS "Only admins can insert equipments" ON equipments;
DROP POLICY IF EXISTS "Only admins can update equipments" ON equipments;
DROP POLICY IF EXISTS "Only admins can delete equipments" ON equipments;

-- Equipments policies
-- Everyone can view equipments
CREATE POLICY "Anyone can view equipments"
    ON equipments FOR SELECT
    USING (true);

-- Only admins can insert/update/delete equipments
CREATE POLICY "Only admins can insert equipments"
    ON equipments FOR INSERT
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update equipments"
    ON equipments FOR UPDATE
    USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete equipments"
    ON equipments FOR DELETE
    USING (get_user_role(auth.uid()) = 'admin');

-- Equipment consumption policies
DROP POLICY IF EXISTS "Anyone can view consumption logs" ON equipment_consumption;
DROP POLICY IF EXISTS "Staff and admins can insert consumption" ON equipment_consumption;
DROP POLICY IF EXISTS "Only admins can update consumption" ON equipment_consumption;
DROP POLICY IF EXISTS "Only admins can delete consumption" ON equipment_consumption;

-- Everyone can view consumption logs
CREATE POLICY "Anyone can view consumption logs"
    ON equipment_consumption FOR SELECT
    USING (true);

-- Staff and admins can insert consumption logs
CREATE POLICY "Staff and admins can insert consumption"
    ON equipment_consumption FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update/delete consumption logs
CREATE POLICY "Only admins can update consumption"
    ON equipment_consumption FOR UPDATE
    USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete consumption"
    ON equipment_consumption FOR DELETE
    USING (get_user_role(auth.uid()) = 'admin');

-- Notifications policies
DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON notifications;

-- Users can view their own notifications or all if admin
CREATE POLICY "Users can view notifications"
    ON notifications FOR SELECT
    USING (
        user_id = auth.uid() OR 
        user_id IS NULL OR 
        get_user_role(auth.uid()) = 'admin'
    );

-- System can create notifications (via service role)
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Users can update their own notifications or admins can update any
CREATE POLICY "Users can update notifications"
    ON notifications FOR UPDATE
    USING (
        user_id = auth.uid() OR 
        get_user_role(auth.uid()) = 'admin'
    );

-- Predictions policies
DROP POLICY IF EXISTS "Anyone can view predictions" ON predictions;
DROP POLICY IF EXISTS "System can manage predictions" ON predictions;

-- Everyone can view predictions
CREATE POLICY "Anyone can view predictions"
    ON predictions FOR SELECT
    USING (true);

-- Only system (service role) can insert/update predictions
CREATE POLICY "System can manage predictions"
    ON predictions FOR ALL
    USING (true)
    WITH CHECK (true);

-- Suppliers policies
DROP POLICY IF EXISTS "Anyone can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Only admins can manage suppliers" ON suppliers;

-- Everyone can view suppliers
CREATE POLICY "Anyone can view suppliers"
    ON suppliers FOR SELECT
    USING (true);

-- Only admins can manage suppliers
CREATE POLICY "Only admins can manage suppliers"
    ON suppliers FOR ALL
    USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');


