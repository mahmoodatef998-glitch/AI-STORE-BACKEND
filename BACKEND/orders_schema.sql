-- Orders and Stock Movements Schema
-- This extends the existing equipment inventory system

-- Create enum for stock movement type
DO $$ BEGIN
    CREATE TYPE stock_movement_type AS ENUM ('IN', 'OUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create orders table
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

-- Create order_materials table
CREATE TABLE IF NOT EXISTS order_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, equipment_id)
);

-- Create stock_movements table (History Log)
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_reference ON orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_order_materials_order_id ON order_materials(order_id);
CREATE INDEX IF NOT EXISTS idx_order_materials_equipment_id ON order_materials(equipment_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_equipment_id ON stock_movements(equipment_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_related_order_id ON stock_movements(related_order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_receiver_name ON stock_movements(receiver_name);

-- Trigger to update updated_at for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Note: We'll trigger this manually in the backend for better control
-- But we keep the function for potential future use

-- Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Staff and admins can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view order materials" ON order_materials;
DROP POLICY IF EXISTS "Anyone can view stock movements" ON stock_movements;

-- Orders policies
CREATE POLICY "Anyone can view orders"
    ON orders FOR SELECT
    USING (true);

CREATE POLICY "Staff and admins can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

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

-- Table for order attachments (receipt files)
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

-- RLS policies for order_attachments
ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view order attachments"
    ON order_attachments FOR SELECT
    USING (true);

CREATE POLICY "Users can insert order attachments"
    ON order_attachments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete order attachments"
    ON order_attachments FOR DELETE
    USING (true);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_attachments_created_at ON order_attachments(created_at);

