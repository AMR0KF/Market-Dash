import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

const VALID_PAYMENT_METHODS = ['CASH_ON_DELIVERY', 'OMT', 'WHISH'];

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { addressId, paymentMethod, notes } = req.body;

    if (!addressId || !paymentMethod) {
      res.status(400).json({ success: false, message: 'Address and payment method are required', data: null });
      return;
    }

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      res.status(400).json({ success: false, message: 'Invalid payment method', data: null });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({ where: { id: addressId, userId } });
      if (!address) {
        throw new Error('Address not found');
      }

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

      const deliveryFee = subtotal >= 50 ? 0 : 5;
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
        const updateRes = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });

        if (updateRes.count === 0) {
          throw new Error(`Insufficient stock available for product: ${item.product.name}`);
        }
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

export const getAdminOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
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
      customer: order.user || { id: 'cust-1', name: 'Customer', email: 'customer@example.com', phone: '' },
      items: order.items.map(item => {
        let image = null;
        try {
          const imgs = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images;
          image = Array.isArray(imgs) ? imgs[0] : imgs;
        } catch {
          image = null;
        }
        return {
          id: item.id,
          quantity: item.quantity,
          price: item.unitPrice,
          product: {
            ...item.product,
            image
          }
        };
      }),
      timeline: [
        { status: 'PENDING', timestamp: order.createdAt },
        ...(order.status !== 'PENDING' ? [{ status: order.status, timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 30).toISOString() }] : [])
      ]
    };

    res.status(200).json({ success: true, message: 'Admin order retrieved', data: parsedOrder });
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
    const { status, startDate, endDate, dateRange, search, userId, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const now = new Date();
    if (dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: startOfDay };
    } else if (dateRange === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: sevenDaysAgo };
    } else if (dateRange === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: thirtyDaysAgo };
    } else if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    if (search) {
      where.OR = [
        { id: { contains: search as string } },
        { user: { name: { contains: search as string } } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: true
        }
      }),
      prisma.order.count({ where })
    ]);

    const formattedOrders = orders.map(order => ({
      ...order,
      customer: order.user || { name: 'Customer' },
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0) || order.items.length,
    }));

    // Return array in data for direct .map compatibility in OrderList.tsx
    res.status(200).json({
      success: true,
      message: 'Orders retrieved',
      data: formattedOrders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
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

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!existing) {
        throw new Error('Order not found');
      }

      if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status }
      });
    });

    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const getOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalOrdersToday,
      todayRevenueAgg,
      pendingOrders,
      totalProductsActive,
      recentOrdersRaw,
      orderItemsGrouped
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfToday }, status: { not: 'CANCELLED' } }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          items: true
        }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      })
    ]);

    const revenueToday = todayRevenueAgg._sum.total || 0;

    const recentOrders = recentOrdersRaw.map(o => ({
      id: o.id,
      customerName: o.user?.name || 'Customer',
      itemsCount: o.items.length,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt
    }));

    // Last 7 days revenue chart
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      
      const dayAgg = await prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: { not: 'CANCELLED' }
        }
      });
      revenueChart.push({
        date: daysOfWeek[d.getDay()],
        revenue: Math.round((dayAgg._sum.total || 0) * 100) / 100
      });
    }

    // Top products
    const productIds = orderItemsGrouped.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    });
    const productMap = new Map(products.map(p => [p.id, p.name]));

    const topProducts = orderItemsGrouped.map(item => ({
      id: item.productId,
      name: productMap.get(item.productId) || 'Product',
      unitsSold: item._sum.quantity || 0,
      revenue: Math.round((item._sum.totalPrice || 0) * 100) / 100
    }));

    res.status(200).json({
      success: true,
      message: 'Order stats retrieved',
      data: {
        totalOrdersToday,
        revenueToday: Math.round(revenueToday * 100) / 100,
        pendingOrders,
        totalProductsActive,
        recentOrders,
        revenueChart,
        topProducts
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

