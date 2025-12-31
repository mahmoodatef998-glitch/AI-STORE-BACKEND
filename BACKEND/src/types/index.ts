export type EquipmentType = 'electrical' | 'manual';
export type NotificationType = 'email' | 'dashboard' | 'whatsapp';
export type UserRole = 'admin' | 'staff';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  quantity_total: number;
  quantity_available: number;
  minimum_threshold: number;
  unit_price: number | null;
  location: string | null;
  supplier_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentConsumption {
  id: string;
  equipment_id: string;
  quantity_used: number;
  purpose: string | null;
  user_id: string;
  date: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  sent: boolean;
  equipment_id: string | null;
  user_id: string | null;
  timestamp: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  equipment_id: string;
  predicted_consumption: number;
  prediction_date: string;
  confidence_score: number | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEquipmentDto {
  name: string;
  type: EquipmentType;
  quantity_total: number;
  quantity_available: number;
  minimum_threshold: number;
  unit_price?: number;
  location?: string;
  supplier_id?: string;
}

export interface UpdateEquipmentDto {
  name?: string;
  type?: EquipmentType;
  quantity_total?: number;
  quantity_available?: number;
  minimum_threshold?: number;
  unit_price?: number;
  location?: string;
  supplier_id?: string;
}

export interface CreateConsumptionDto {
  equipment_id: string;
  quantity_used: number;
  purpose?: string;
}

export interface ConsumptionFilter {
  equipment_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface Order {
  id: string;
  generator_model: string;
  order_reference: string;
  receiver_name: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrderMaterial {
  id: string;
  order_id: string;
  equipment_id: string;
  quantity: number;
  unit: string | null;
  created_at: string;
}

export interface StockMovement {
  id: string;
  equipment_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  related_order_id: string | null;
  receiver_name: string | null;
  created_by: string;
  created_at: string;
}

export interface CreateOrderDto {
  generator_model: string;
  order_reference: string;
  receiver_name: string;
  notes?: string;
  materials: {
    equipment_id: string;
    quantity: number;
  }[];
}

export interface StockMovementFilter {
  equipment_id?: string;
  type?: 'IN' | 'OUT';
  receiver_name?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface OrderAttachment {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string;
  created_at: string;
  file_url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

