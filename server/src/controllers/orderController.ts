import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { addressId, paymentMethod, notes } = req.body;

    if (!addressId || !paymentMethod) {
      res.status(400).json({ success: false, message: 'Address and payment method are required', data: null });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } }
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      let subtotal = 0;
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.product.name}`);
        }
        subtotal += item.quantity * item.product.price;
      }

      const deliveryFee = subtotal >= 50000 ? 0 : 5000;
      const total = subtotal + deliveryFee;

      const order = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal,
          deliveryFee,
          total,
          paymentMethod,
          paymentStatus: 'PENDING',
          notes,
          status: 'PENDING',
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: item.quantity * item.product.price
            }))
          }
        },
        include: { items: true }
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, data: null });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: { select: { name: true, images: true } } } } }
      }),
      prisma.order.count({ where: { userId } })
    ]);

    const parsedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? JSON.parse(item.product.images as any) : []
        }
      }))
    }));

    res.status(200).json({
      success: true,
      message: 'Orders retrieved',
      data: {
        data: parsedOrders,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { include: { product: true } },
        address: true
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found', data: null });
      return;
    }

    const parsedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images ? JSON.parse(item.product.images as any) : []
        }
      }))
    };

    res.status(200).json({ success: true, message: 'Order retrieved', data: parsedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { orderId } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'PENDING') {
        throw new Error('Only pending orders can be cancelled');
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      return updatedOrder;
    });

    res.status(200).json({ success: true, message: 'Order cancelled successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, data: null });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, startDate, endDate, userId, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.order.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved',
      data: {
        data: orders,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status', data: null });
      return;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const getOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalOrders = await prisma.order.count();
    
    const revenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } }
    });
    const totalRevenue = revenueResult._sum.total || 0;

    const ordersByStatusRaw = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const ordersByStatus = ordersByStatusRaw.reduce((acc: any, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {});

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.findMany({
      where: { 
        createdAt: { gte: sevenDaysAgo },
        status: { not: 'CANCELLED' }
      },
      select: { total: true, createdAt: true }
    });

    const revenueByDay = recentOrders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + order.total;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: 'Order stats retrieved',
      data: {
        totalOrders,
        totalRevenue,
        ordersByStatus,
        revenueByDay
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};
