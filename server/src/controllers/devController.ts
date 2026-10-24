import { Request, Response } from 'express';
import { exec } from 'child_process';
import { prisma } from '../prisma/index';

export const seedDummyData = async (req: Request, res: Response) => {
  exec('npm run seed', { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error('Seed execution error:', error, stderr);
      return res.status(500).json({ success: false, message: 'Seed failed', error: stderr || error.message });
    }
    return res.json({ success: true, message: 'Database populated successfully with comprehensive dummy data', output: stdout });
  });
};

export const clearDummyData = async (req: Request, res: Response) => {
  try {
    // Delete in order to respect foreign keys
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    res.json({ success: true, message: 'All dummy data cleared successfully' });
  } catch (error: any) {
    console.error('Error clearing data:', error);
    res.status(500).json({ success: false, message: 'Failed to clear data', error: error.message });
  }
};
