import { supabase } from '../config/supabase';
import { Order, CreateOrderDto, OrderMaterial, StockMovement } from '../types';

export class OrderService {
  async createOrder(dto: CreateOrderDto, userId: string): Promise<Order> {
    // Start transaction-like operation
    // First, validate all materials have sufficient stock
    for (const material of dto.materials) {
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipments')
        .select('quantity_available, name')
        .eq('id', material.equipment_id)
        .single();

      if (equipmentError || !equipment) {
        throw new Error(`Equipment ${material.equipment_id} not found`);
      }

      if (equipment.quantity_available < material.quantity) {
        throw new Error(
          `Insufficient stock for ${equipment.name}. Available: ${equipment.quantity_available}, Requested: ${material.quantity}`
        );
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        generator_model: dto.generator_model,
        order_reference: dto.order_reference,
        receiver_name: dto.receiver_name,
        notes: dto.notes || null,
        created_by: userId,
      })
      .select()
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Failed to create order');

    // Create order materials and deduct stock
    for (const material of dto.materials) {
      // Get equipment info for unit
      await supabase
        .from('equipments')
        .select('quantity_available, name')
        .eq('id', material.equipment_id)
        .single();

      // Create order material
      const { error: materialError } = await supabase
        .from('order_materials')
        .insert({
          order_id: order.id,
          equipment_id: material.equipment_id,
          quantity: material.quantity,
        });

      if (materialError) {
        // Rollback: delete order
        await supabase.from('orders').delete().eq('id', order.id);
        throw materialError;
      }

      // Deduct stock - get current value and subtract
      const { data: currentEquipment } = await supabase
        .from('equipments')
        .select('quantity_available')
        .eq('id', material.equipment_id)
        .single();

      if (!currentEquipment) {
        // Rollback: delete order and materials
        await supabase.from('order_materials').delete().eq('order_id', order.id);
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Equipment ${material.equipment_id} not found`);
      }

      const newQuantity = currentEquipment.quantity_available - material.quantity;

      const { error: updateError } = await supabase
        .from('equipments')
        .update({
          quantity_available: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', material.equipment_id);

      if (updateError) {
        // Rollback: delete order and materials
        await supabase.from('order_materials').delete().eq('order_id', order.id);
        await supabase.from('orders').delete().eq('id', order.id);
        throw updateError;
      }

      // Create stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          equipment_id: material.equipment_id,
          type: 'OUT',
          quantity: material.quantity,
          related_order_id: order.id,
          receiver_name: dto.receiver_name,
          created_by: userId,
        });

      if (movementError) {
        console.error('Error creating stock movement:', movementError);
        // Don't rollback for movement error, but log it
      }
    }

    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async getOrderMaterials(orderId: string): Promise<OrderMaterial[]> {
    const { data, error } = await supabase
      .from('order_materials')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data || [];
  }

  async updateOrder(
    orderId: string,
    updates: Partial<CreateOrderDto>,
    _userId: string
  ): Promise<Order> {
    // Get existing order
    const existingOrder = await this.getOrderById(orderId);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Update order fields
    const updateData: any = {};
    if (updates.generator_model) updateData.generator_model = updates.generator_model;
    if (updates.order_reference) updateData.order_reference = updates.order_reference;
    if (updates.receiver_name) updateData.receiver_name = updates.receiver_name;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updatedOrder) throw new Error('Failed to update order');

    // If materials are being updated, handle them
    if (updates.materials) {
      // Delete existing materials
      await supabase.from('order_materials').delete().eq('order_id', orderId);

      // Add new materials
      for (const material of updates.materials) {
        const { error: materialError } = await supabase
          .from('order_materials')
          .insert({
            order_id: orderId,
            equipment_id: material.equipment_id,
            quantity: material.quantity,
          });

        if (materialError) throw materialError;
      }
    }

    return updatedOrder;
  }

  async deleteOrder(orderId: string, _userId: string): Promise<void> {
    // Check if order exists
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Delete order materials first (cascade should handle this, but being explicit)
    await supabase.from('order_materials').delete().eq('order_id', orderId);

    // Delete stock movements related to this order
    await supabase.from('stock_movements').delete().eq('related_order_id', orderId);

    // Delete the order
    const { error } = await supabase.from('orders').delete().eq('id', orderId);

    if (error) throw error;
  }

  async getStockMovements(filter?: {
    equipment_id?: string;
    type?: 'IN' | 'OUT';
    receiver_name?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<StockMovement[]> {
    let query = supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.equipment_id) {
      query = query.eq('equipment_id', filter.equipment_id);
    }

    if (filter?.type) {
      query = query.eq('type', filter.type);
    }

    if (filter?.receiver_name) {
      query = query.ilike('receiver_name', `%${filter.receiver_name}%`);
    }

    if (filter?.start_date) {
      query = query.gte('created_at', filter.start_date);
    }

    if (filter?.end_date) {
      query = query.lte('created_at', filter.end_date);
    }

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    if (filter?.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async uploadAttachment(
    orderId: string,
    fileData: {
      fileName: string;
      filePath: string;
      fileSize: number;
      fileType: string;
    },
    userId: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from('order_attachments')
      .insert({
        order_id: orderId,
        file_name: fileData.fileName,
        file_path: fileData.filePath,
        file_size: fileData.fileSize,
        file_type: fileData.fileType,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrderAttachments(orderId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('order_attachments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    // Get attachment info first to delete file
    const { data: attachment, error: fetchError } = await supabase
      .from('order_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete file from filesystem
    if (attachment?.file_path) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'uploads', 'receipts', attachment.file_path);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('order_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) throw error;
  }
}

