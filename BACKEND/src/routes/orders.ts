import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getStockMovements,
  uploadReceipt,
  getOrderAttachments,
  deleteAttachment,
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation middleware
const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', errors: errors.array() });
  }
  next();
};

// Create order
router.post(
  '/',
  [
    body('generator_model').trim().notEmpty().withMessage('Generator model is required'),
    body('order_reference').trim().notEmpty().withMessage('Order reference is required'),
    body('receiver_name').trim().notEmpty().withMessage('Receiver name is required'),
    body('materials').isArray({ min: 1 }).withMessage('At least one material is required'),
    body('materials.*.equipment_id').isUUID().withMessage('Invalid equipment ID'),
    body('materials.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  ],
  validate,
  createOrder
);

// Get all orders
router.get('/', getAllOrders);

// Get order by ID
router.get('/:id', getOrderById);

// Update order
router.put('/:id', [
  body('generator_model').optional().trim().notEmpty(),
  body('order_reference').optional().trim().notEmpty(),
  body('receiver_name').optional().trim().notEmpty(),
  body('notes').optional(),
  body('materials').optional().isArray(),
  body('materials.*.equipment_id').optional().isUUID(),
  body('materials.*.quantity').optional().isInt({ min: 1 }),
  validate,
], updateOrder);

// Delete order
router.delete('/:id', deleteOrder);

// Get stock movements (history)
router.get('/history/movements', getStockMovements);

// Upload receipt file for order
router.post('/:id/attachments', upload.single('file'), uploadReceipt);

// Get order attachments
router.get('/:id/attachments', getOrderAttachments);

// Delete attachment
router.delete('/attachments/:attachmentId', deleteAttachment);

export default router;

