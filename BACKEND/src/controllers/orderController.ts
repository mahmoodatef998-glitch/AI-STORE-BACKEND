import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrderService } from '../services/orderService';
import { ApiResponse, Order, OrderMaterial, StockMovement, CreateOrderDto, OrderAttachment } from '../types';
import { getFileUrl } from '../middleware/upload';

const orderService = new OrderService();

export const createOrder = async (
  req: AuthRequest,
  res: Response<ApiResponse<Order>>
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const order = await orderService.createOrder(req.body, req.user.id);
    res.status(201).json({ success: true, data: order, message: 'Materials successfully deducted from store' });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    });
  }
};

export const getAllOrders = async (
  req: AuthRequest,
  res: Response<ApiResponse<Order[]>>
): Promise<void> => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    });
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response<ApiResponse<Order & { materials: OrderMaterial[] }>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const materials = await orderService.getOrderMaterials(id);
    res.json({ success: true, data: { ...order, materials } });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    });
  }
};

export const updateOrder = async (
  req: AuthRequest,
  res: Response<ApiResponse<Order>>
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const order = await orderService.updateOrder(id, req.body, req.user.id);
    res.json({ success: true, data: order, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order',
    });
  }
};

export const deleteOrder = async (
  req: AuthRequest,
  res: Response<ApiResponse<void>>
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    await orderService.deleteOrder(id, req.user.id);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete order',
    });
  }
};

export const getStockMovements = async (
  req: AuthRequest,
  res: Response<ApiResponse<StockMovement[]>>
): Promise<void> => {
  try {
    const filter = {
      equipment_id: req.query.equipment_id as string,
      type: req.query.type as 'IN' | 'OUT' | undefined,
      receiver_name: req.query.receiver_name as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };

    const movements = await orderService.getStockMovements(filter);
    res.json({ success: true, data: movements });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stock movements',
    });
  }
};

export const uploadReceipt = async (
  req: AuthRequest,
  res: Response<ApiResponse<OrderAttachment>>
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const { id } = req.params;
    const attachment = await orderService.uploadAttachment(
      id,
      {
        fileName: req.file.originalname,
        filePath: req.file.filename,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      },
      req.user.id
    );

    res.json({
      success: true,
      data: {
        ...attachment,
        file_url: getFileUrl(attachment.file_path),
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    });
  }
};

export const getOrderAttachments = async (
  req: AuthRequest,
  res: Response<ApiResponse<OrderAttachment[]>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const attachments = await orderService.getOrderAttachments(id);
    
    // Add file URLs
    const attachmentsWithUrls = attachments.map((att) => ({
      ...att,
      file_url: getFileUrl(att.file_path),
    }));

    res.json({ success: true, data: attachmentsWithUrls });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch attachments',
    });
  }
};

export const deleteAttachment = async (
  req: AuthRequest,
  res: Response<ApiResponse<void>>
): Promise<void> => {
  try {
    const { attachmentId } = req.params;
    await orderService.deleteAttachment(attachmentId);
    res.json({ success: true, message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete attachment',
    });
  }
};

