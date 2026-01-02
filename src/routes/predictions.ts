import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authenticateToken } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { ApiResponse, Prediction } from '../types';

const router = Router();

router.use(authenticateToken);

// Get predictions for all equipment or specific equipment
router.get('/', async (req: AuthRequest, res: Response<ApiResponse<Prediction[]>>): Promise<void> => {
  try {
    const { equipment_id } = req.query;

    let query = supabase
      .from('predictions')
      .select('*')
      .order('prediction_date', { ascending: true });

    if (equipment_id) {
      query = query.eq('equipment_id', equipment_id as string);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch predictions',
    });
  }
});

// Get predictions for specific equipment
router.get('/:equipment_id', async (
  req: AuthRequest,
  res: Response<ApiResponse<Prediction[]>>
): Promise<void> => {
  try {
    const { equipment_id } = req.params;

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('equipment_id', equipment_id)
      .order('prediction_date', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch predictions',
    });
  }
});

export default router;


