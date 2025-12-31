import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InventoryService } from '../services/inventoryService';
import { ApiResponse, Equipment } from '../types';

const inventoryService = new InventoryService();

export const getAllEquipments = async (
  _req: AuthRequest,
  res: Response<ApiResponse<Equipment[]>>
): Promise<void> => {
  try {
    const equipments = await inventoryService.getAllEquipments();
    res.json({ success: true, data: equipments });
  } catch (error) {
    console.error('Error fetching equipments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch equipments',
    });
  }
};

export const getEquipmentById = async (
  req: AuthRequest,
  res: Response<ApiResponse<Equipment>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const equipment = await inventoryService.getEquipmentById(id);

    if (!equipment) {
      res.status(404).json({ success: false, error: 'Equipment not found' });
      return;
    }

    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch equipment',
    });
  }
};

export const createEquipment = async (
  req: AuthRequest,
  res: Response<ApiResponse<Equipment>>
): Promise<void> => {
  try {
    const equipment = await inventoryService.createEquipment(req.body);
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create equipment',
    });
  }
};

export const updateEquipment = async (
  req: AuthRequest,
  res: Response<ApiResponse<Equipment>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const equipment = await inventoryService.updateEquipment(id, req.body);
    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Error updating equipment:', error);
    const statusCode = (error as { statusCode?: number })?.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update equipment',
    });
  }
};

export const deleteEquipment = async (
  req: AuthRequest,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  try {
    const { id } = req.params;
    await inventoryService.deleteEquipment(id);
    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete equipment',
    });
  }
};

export const getLowStockEquipments = async (
  _req: AuthRequest,
  res: Response<ApiResponse<Equipment[]>>
): Promise<void> => {
  try {
    const equipments = await inventoryService.getLowStockEquipments();
    res.json({ success: true, data: equipments });
  } catch (error) {
    console.error('Error fetching low stock equipments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch low stock equipments',
    });
  }
};

