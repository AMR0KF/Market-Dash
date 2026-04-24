import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomers = async (req: any, res: any) => {
  try {
    const { search } = req.query;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true
          }
        },
        addresses: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => {
      // Calculate total orders and total spent
      // In a real app, you might want to use Prisma aggregations for performance
      // if the user has many orders, but this works for a typical scenario.
      // Alternatively, we can do a separate aggregation query.
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        totalOrders: user.orders.length, // Note: this is just the recent 5 if we limit it. Let's fix this.
        totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0), // Same issue.
        recentOrders: user.orders.map(o => ({
          id: o.id,
          status: o.status,
          total: o.total,
          date: o.createdAt
        })),
        addresses: user.addresses
      };
    });

    // Let's do proper aggregations for totalOrders and totalSpent
    const userIds = users.map(u => u.id);
    const aggregations = await prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: { id: true },
      _sum: { total: true }
    });

    const aggMap = new Map(aggregations.map(agg => [agg.userId, agg]));

    const finalUsers = formattedUsers.map(user => {
      const agg = aggMap.get(user.id);
      return {
        ...user,
        totalOrders: agg?._count.id || 0,
        totalSpent: agg?._sum.total || 0,
      };
    });

    res.json({ success: true, data: finalUsers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
