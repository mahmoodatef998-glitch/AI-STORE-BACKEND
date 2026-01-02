-- Seed data for testing the Equipment Inventory Management System

-- Insert sample suppliers
INSERT INTO suppliers (id, name, contact_info) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Generator Supplies Co.', 'contact@generatorsupplies.com, +1-555-0101'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Tool Depot Inc.', 'sales@tooldepot.com, +1-555-0102'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Electrical Equipment Ltd.', 'info@electricalequip.com, +1-555-0103')
ON CONFLICT (id) DO NOTHING;

-- Insert sample equipments
INSERT INTO equipments (id, name, type, quantity_total, quantity_available, minimum_threshold, unit_price, location, supplier_id) VALUES
    -- Electrical equipments
    ('660e8400-e29b-41d4-a716-446655440001', 'Portable Generator 5kW', 'electrical', 50, 45, 10, 899.99, 'Warehouse A', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Portable Generator 10kW', 'electrical', 30, 25, 5, 1599.99, 'Warehouse A', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440003', 'Extension Cord 50ft', 'electrical', 100, 85, 20, 29.99, 'Warehouse B', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440004', 'Extension Cord 100ft', 'electrical', 80, 70, 15, 49.99, 'Warehouse B', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440005', 'Voltage Meter', 'electrical', 40, 35, 10, 79.99, 'Warehouse C', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440006', 'Multimeter', 'electrical', 35, 30, 8, 129.99, 'Warehouse C', '550e8400-e29b-41d4-a716-446655440003'),
    
    -- Manual tools
    ('660e8400-e29b-41d4-a716-446655440007', 'Wrench Set', 'manual', 60, 55, 15, 49.99, 'Warehouse D', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440008', 'Screwdriver Set', 'manual', 75, 70, 20, 24.99, 'Warehouse D', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440009', 'Hammer', 'manual', 50, 45, 12, 19.99, 'Warehouse D', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440010', 'Pliers Set', 'manual', 45, 40, 10, 34.99, 'Warehouse D', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440011', 'Drill Set', 'manual', 25, 20, 5, 199.99, 'Warehouse E', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440012', 'Socket Set', 'manual', 40, 35, 10, 89.99, 'Warehouse E', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Note: Consumption logs and notifications will be created through the application
-- User data should be managed through Supabase Auth


