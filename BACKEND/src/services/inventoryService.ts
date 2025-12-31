import { supabase } from '../config/supabase';
import { Equipment, CreateEquipmentDto, UpdateEquipmentDto } from '../types';

export class InventoryService {
  async getAllEquipments(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getEquipmentById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async createEquipment(dto: CreateEquipmentDto): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipments')
      .insert(dto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEquipment(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipments')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const notFoundError = new Error('Equipment not found') as Error & { statusCode?: number };
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
    return data;
  }

  async deleteEquipment(id: string): Promise<void> {
    const { error } = await supabase
      .from('equipments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getLowStockEquipments(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .order('quantity_available', { ascending: true });

    if (error) throw error;
    
    // Filter in JavaScript since we need to compare quantity_available with minimum_threshold
    return (data || []).filter(
      (equipment) => equipment.quantity_available <= (equipment.minimum_threshold || 0)
    );
  }

  async checkAvailability(equipmentId: string, quantity: number): Promise<boolean> {
    const equipment = await this.getEquipmentById(equipmentId);
    if (!equipment) return false;
    return equipment.quantity_available >= quantity;
  }
}

