import { Router } from 'express';
import {
  getAllEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getLowStockEquipments,
} from '../controllers/equipmentController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateEquipment, validateUpdateEquipment, validate } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all equipments
router.get('/', getAllEquipments);

// Get low stock equipments
router.get('/low-stock', getLowStockEquipments);

// Get equipment by ID
router.get('/:id', getEquipmentById);

// Create equipment (admin only)
router.post('/', requireAdmin, validate(validateEquipment), createEquipment);

// Update equipment (admin only)
router.put('/:id', requireAdmin, validate(validateUpdateEquipment), updateEquipment);

// Delete equipment (admin only)
router.delete('/:id', requireAdmin, deleteEquipment);

export default router;


