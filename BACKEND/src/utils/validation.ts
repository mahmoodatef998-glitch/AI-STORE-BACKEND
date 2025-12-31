import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array(),
    });
  };
};

export const validateEquipment = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('type')
    .isIn(['electrical', 'manual'])
    .withMessage('Type must be either "electrical" or "manual"'),
  body('quantity_total')
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a non-negative integer'),
  body('quantity_available')
    .isInt({ min: 0 })
    .withMessage('Available quantity must be a non-negative integer')
    .custom((value, { req }) => {
      if (value > req.body.quantity_total) {
        throw new Error('Available quantity cannot exceed total quantity');
      }
      return true;
    }),
  body('minimum_threshold')
    .isInt({ min: 0 })
    .withMessage('Minimum threshold must be a non-negative integer'),
  body('unit_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('supplier_id')
    .optional()
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID'),
];

export const validateConsumption = [
  body('equipment_id')
    .isUUID()
    .withMessage('Equipment ID must be a valid UUID'),
  body('quantity_used')
    .isInt({ min: 1 })
    .withMessage('Quantity used must be a positive integer'),
  body('purpose')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Purpose must be less than 500 characters'),
];

export const validateUpdateEquipment = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('type')
    .optional()
    .isIn(['electrical', 'manual'])
    .withMessage('Type must be either "electrical" or "manual"'),
  body('quantity_total')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a non-negative integer'),
  body('quantity_available')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available quantity must be a non-negative integer'),
  body('minimum_threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum threshold must be a non-negative integer'),
  body('unit_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('supplier_id')
    .optional()
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID'),
];

