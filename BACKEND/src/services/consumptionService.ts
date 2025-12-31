import { supabase } from '../config/supabase';
import {
  EquipmentConsumption,
  CreateConsumptionDto,
  ConsumptionFilter,
} from '../types';

export class ConsumptionService {
  async logConsumption(
    dto: CreateConsumptionDto,
    userId: string
  ): Promise<EquipmentConsumption> {
    // First check if equipment has enough quantity
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipments')
      .select('quantity_available')
      .eq('id', dto.equipment_id)
      .single();

    if (equipmentError) throw equipmentError;
    if (!equipment) {
      const notFoundError = new Error('Equipment not found') as Error & { statusCode?: number };
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    if (equipment.quantity_available < dto.quantity_used) {
      const insufficientError = new Error(
        `Insufficient quantity. Available: ${equipment.quantity_available}, Requested: ${dto.quantity_used}`
      ) as Error & { statusCode?: number };
      insufficientError.statusCode = 400;
      throw insufficientError;
    }

    // Insert consumption log (trigger will auto-decrement quantity)
    const { data, error } = await supabase
      .from('equipment_consumption')
      .insert({
        equipment_id: dto.equipment_id,
        quantity_used: dto.quantity_used,
        purpose: dto.purpose || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConsumptionHistory(filter: ConsumptionFilter = {}): Promise<EquipmentConsumption[]> {
    let query = supabase
      .from('equipment_consumption')
      .select('*')
      .order('date', { ascending: false });

    if (filter.equipment_id) {
      query = query.eq('equipment_id', filter.equipment_id);
    }

    if (filter.user_id) {
      query = query.eq('user_id', filter.user_id);
    }

    if (filter.start_date) {
      query = query.gte('date', filter.start_date);
    }

    if (filter.end_date) {
      query = query.lte('date', filter.end_date);
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getConsumptionById(id: string): Promise<EquipmentConsumption | null> {
    const { data, error } = await supabase
      .from('equipment_consumption')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async getConsumptionByEquipment(equipmentId: string): Promise<EquipmentConsumption[]> {
    const { data, error } = await supabase
      .from('equipment_consumption')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

