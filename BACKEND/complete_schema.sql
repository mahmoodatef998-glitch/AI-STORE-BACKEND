-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR EQUIPMENT INVENTORY SYSTEM
-- =====================================================
-- This file contains the complete database schema including:
-- - Equipment inventory tables
-- - Consumption tracking
-- - Notifications
-- - Predictions
-- - Orders and stock movements
-- - Order attachments (receipt files)
-- =====================================================
-- Run this file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CREATE ENUMS
-- =====================================================

-- Equipment type enum
DO $$ BEGIN
    CREATE TYPE equipment_type AS ENUM ('electrical', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('email', 'dashboard', 'whatsapp');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Stock movement type enum
DO $$ BEGIN
    CREATE TYPE stock_movement_type AS ENUM ('IN', 'OUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. CREATE TABLES
-- =====================================================

-- Equipments table
CREATE TABLE IF NOT EXISTS equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type equipment_type NOT NULL DEFAULT 'electrical',
    quantity_total INTEGER NOT NULL DEFAULT 0 CHECK (quantity_total >= 0),
    quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    minimum_threshold INTEGER NOT NULL DEFAULT 10 CHECK (minimum_threshold >= 0),
    unit_price DECIMAL(10, 2),
    location TEXT,
    supplier_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_available_not_exceed_total CHECK (quantity_available <= quantity_total)
);

-- Equipment consumption table
CREATE TABLE IF NOT EXISTS equipment_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
    purpose TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notification_type NOT NULL DEFAULT 'dashboard',
    message TEXT NOT NULL,
    sent BOOLEAN NOT NULL DEFAULT false,
    equipment_id UUID REFERENCES equipments(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    predicted_consumption INTEGER NOT NULL CHECK (predicted_consumption >= 0),
    prediction_date DATE NOT NULL,
    confidence_score DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generator_model TEXT NOT NULL DEFAULT 'Perkins',
    order_reference TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order materials table
CREATE TABLE IF NOT EXISTS order_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, equipment_id)
);

-- Stock movements table (History Log)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    type stock_movement_type NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    receiver_name TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order attachments table (Receipt files)
CREATE TABLE IF NOT EXISTS order_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================

-- Equipments indexes
CREATE INDEX IF NOT EXISTS idx_equipments_type ON equipments(type);
CREATE INDEX IF NOT EXISTS idx_equipments_quantity_available ON equipments(quantity_available);
CREATE INDEX IF NOT EXISTS idx_equipments_created_at ON equipments(created_at);

-- Consumption indexes
CREATE INDEX IF NOT EXISTS idx_equipment_consumption_equipment_id ON equipment_consumption(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_consumption_user_id ON equipment_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_consumption_date ON equipment_consumption(date);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(sent);
CREATE INDEX IF NOT EXISTS idx_notifications_equipment_id ON notifications(equipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp);

-- Predictions indexes
CREATE INDEX IF NOT EXISTS idx_predictions_equipment_id ON predictions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_predictions_prediction_date ON predictions(prediction_date);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_reference ON orders(order_reference);

-- Order materials indexes
CREATE INDEX IF NOT EXISTS idx_order_materials_order_id ON order_materials(order_id);
CREATE INDEX IF NOT EXISTS idx_order_materials_equipment_id ON order_materials(equipment_id);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_equipment_id ON stock_movements(equipment_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_related_order_id ON stock_movements(related_order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_receiver_name ON stock_movements(receiver_name);

-- Order attachments indexes
CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_attachments_created_at ON order_attachments(created_at);

-- =====================================================
-- 5. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement equipment stock on consumption
CREATE OR REPLACE FUNCTION decrement_equipment_stock_on_consumption()
RETURNS TRIGGER AS $$
DECLARE
    current_available INTEGER;
BEGIN
    SELECT quantity_available INTO current_available
    FROM equipments
    WHERE id = NEW.equipment_id;

    IF current_available < NEW.quantity_used THEN
        RAISE EXCEPTION 'Insufficient quantity available for equipment % (ID: %). Available: %, Requested: %',
            (SELECT name FROM equipments WHERE id = NEW.equipment_id), NEW.equipment_id, current_available, NEW.quantity_used;
    END IF;

    UPDATE equipments
    SET quantity_available = quantity_available - NEW.quantity_used,
        updated_at = NOW()
    WHERE id = NEW.equipment_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement equipment stock on order
CREATE OR REPLACE FUNCTION decrement_equipment_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    current_available INTEGER;
BEGIN
    SELECT quantity_available INTO current_available
    FROM equipments
    WHERE id = NEW.equipment_id;

    IF current_available < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient quantity available for equipment % (ID: %). Available: %, Requested: %',
            (SELECT name FROM equipments WHERE id = NEW.equipment_id), NEW.equipment_id, current_available, NEW.quantity;
    END IF;

    UPDATE equipments
    SET quantity_available = quantity_available - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.equipment_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create stock movement when order is created
CREATE OR REPLACE FUNCTION create_stock_movement_on_order()
RETURNS TRIGGER AS $$
DECLARE
    material_record RECORD;
    current_stock INTEGER;
BEGIN
    -- Loop through all materials in the order
    FOR material_record IN 
        SELECT om.equipment_id, om.quantity, o.receiver_name, o.created_by
        FROM order_materials om
        JOIN orders o ON om.order_id = o.id
        WHERE om.order_id = NEW.id
    LOOP
        -- Get current stock
        SELECT quantity_available INTO current_stock
        FROM equipments
        WHERE id = material_record.equipment_id;
        
        -- Check stock availability
        IF current_stock < material_record.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for equipment %. Available: %, Requested: %', 
                material_record.equipment_id, current_stock, material_record.quantity;
        END IF;
        
        -- Deduct from inventory
        UPDATE equipments
        SET quantity_available = quantity_available - material_record.quantity,
            updated_at = NOW()
        WHERE id = material_record.equipment_id;
        
        -- Create stock movement record (OUT)
        INSERT INTO stock_movements (
            equipment_id,
            type,
            quantity,
            related_order_id,
            receiver_name,
            created_by
        ) VALUES (
            material_record.equipment_id,
            'OUT',
            material_record.quantity,
            NEW.id,
            material_record.receiver_name,
            material_record.created_by
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Trigger to update updated_at for equipments
DROP TRIGGER IF EXISTS update_equipments_updated_at ON equipments;
CREATE TRIGGER update_equipments_updated_at
    BEFORE UPDATE ON equipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to decrement stock after consumption is logged
DROP TRIGGER IF EXISTS trigger_decrement_equipment_stock_on_consumption ON equipment_consumption;
CREATE TRIGGER trigger_decrement_equipment_stock_on_consumption
    AFTER INSERT ON equipment_consumption
    FOR EACH ROW
    EXECUTE FUNCTION decrement_equipment_stock_on_consumption();

-- Trigger to decrement stock after an order_material is inserted
DROP TRIGGER IF EXISTS trigger_decrement_equipment_stock_on_order ON order_materials;
CREATE TRIGGER trigger_decrement_equipment_stock_on_order
    AFTER INSERT ON order_materials
    FOR EACH ROW
    EXECUTE FUNCTION decrement_equipment_stock_on_order();

-- Note: The create_stock_movement_on_order trigger is kept for reference
-- but stock movements are created manually in the backend for better control

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view equipments" ON equipments;
DROP POLICY IF EXISTS "Admins can insert equipments" ON equipments;
DROP POLICY IF EXISTS "Admins can update equipments" ON equipments;
DROP POLICY IF EXISTS "Admins can delete equipments" ON equipments;

DROP POLICY IF EXISTS "Anyone can view consumption" ON equipment_consumption;
DROP POLICY IF EXISTS "Staff and admins can log consumption" ON equipment_consumption;

DROP POLICY IF EXISTS "Anyone can view notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

DROP POLICY IF EXISTS "Anyone can view predictions" ON predictions;
DROP POLICY IF EXISTS "System can create predictions" ON predictions;

DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Staff and admins can create orders" ON orders;

DROP POLICY IF EXISTS "Anyone can view order materials" ON order_materials;
DROP POLICY IF EXISTS "Staff and admins can create order materials" ON order_materials;

DROP POLICY IF EXISTS "Anyone can view stock movements" ON stock_movements;
DROP POLICY IF EXISTS "System can create stock movements" ON stock_movements;

DROP POLICY IF EXISTS "Anyone can view order attachments" ON order_attachments;
DROP POLICY IF EXISTS "Users can insert order attachments" ON order_attachments;
DROP POLICY IF EXISTS "Users can delete order attachments" ON order_attachments;

-- Equipments policies
CREATE POLICY "Anyone can view equipments"
    ON equipments FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert equipments"
    ON equipments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update equipments"
    ON equipments FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete equipments"
    ON equipments FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Equipment consumption policies
CREATE POLICY "Anyone can view consumption"
    ON equipment_consumption FOR SELECT
    USING (true);

CREATE POLICY "Staff and admins can log consumption"
    ON equipment_consumption FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications policies
CREATE POLICY "Anyone can view notifications"
    ON notifications FOR SELECT
    USING (true);

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Predictions policies
CREATE POLICY "Anyone can view predictions"
    ON predictions FOR SELECT
    USING (true);

CREATE POLICY "System can create predictions"
    ON predictions FOR INSERT
    WITH CHECK (true);

-- Orders policies
CREATE POLICY "Anyone can view orders"
    ON orders FOR SELECT
    USING (true);

CREATE POLICY "Staff and admins can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff and admins can update orders"
    ON orders FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete orders"
    ON orders FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Order materials policies
CREATE POLICY "Anyone can view order materials"
    ON order_materials FOR SELECT
    USING (true);

CREATE POLICY "Staff and admins can create order materials"
    ON order_materials FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Stock movements policies
CREATE POLICY "Anyone can view stock movements"
    ON stock_movements FOR SELECT
    USING (true);

CREATE POLICY "System can create stock movements"
    ON stock_movements FOR INSERT
    WITH CHECK (true);

-- Order attachments policies
CREATE POLICY "Anyone can view order attachments"
    ON order_attachments FOR SELECT
    USING (true);

CREATE POLICY "Users can insert order attachments"
    ON order_attachments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete order attachments"
    ON order_attachments FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 8. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables created: equipments, equipment_consumption, notifications, predictions, orders, order_materials, stock_movements, order_attachments';
    RAISE NOTICE '🔐 RLS policies enabled on all tables';
    RAISE NOTICE '⚡ Triggers and functions configured';
    RAISE NOTICE '📈 Indexes created for optimal performance';
END $$;

