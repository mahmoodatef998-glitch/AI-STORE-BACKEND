import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ConsumptionService } from '../services/consumptionService';
import { ApiResponse, EquipmentConsumption, ConsumptionFilter } from '../types';

const consumptionService = new ConsumptionService();

export const logConsumption = async (
  req: AuthRequest,
  res: Response<ApiResponse<EquipmentConsumption>>
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const consumption = await consumptionService.logConsumption(
      req.body,
      req.user.id
    );
    res.status(201).json({ success: true, data: consumption });
  } catch (error) {
    console.error('Error logging consumption:', error);
    const statusCode = (error as { statusCode?: number })?.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to log consumption',
    });
  }
};

export const getConsumptionHistory = async (
  req: AuthRequest,
  res: Response<ApiResponse<EquipmentConsumption[]>>
): Promise<void> => {
  try {
    const filter: ConsumptionFilter = {
      equipment_id: req.query.equipment_id as string,
      user_id: req.query.user_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };

    const history = await consumptionService.getConsumptionHistory(filter);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching consumption history:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch consumption history',
    });
  }
};

export const getConsumptionById = async (
  req: AuthRequest,
  res: Response<ApiResponse<EquipmentConsumption>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const consumption = await consumptionService.getConsumptionById(id);

    if (!consumption) {
      res.status(404).json({ success: false, error: 'Consumption record not found' });
      return;
    }

    res.json({ success: true, data: consumption });
  } catch (error) {
    console.error('Error fetching consumption:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch consumption',
    });
  }
};


