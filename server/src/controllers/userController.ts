import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';
import bcrypt from 'bcrypt';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, createdAt: true, addresses: true }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found', data: null });
      return;
    }

    res.status(200).json({ success: true, message: 'Profile retrieved', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true }
    });

    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Invalid password data', data: null });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found', data: null });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password', data: null });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.status(200).json({ success: true, message: 'Password changed successfully', data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });

    res.status(200).json({ success: true, message: 'Addresses retrieved', data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { label, line1, line2, city, region, isDefault } = req.body;

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
      }

      const existingCount = await tx.address.count({ where: { userId } });
      const setAsDefault = isDefault || existingCount === 0;

      return tx.address.create({
        data: { userId, label, line1, line2, city, region, isDefault: setAsDefault }
      });
    });

    res.status(201).json({ success: true, message: 'Address added', data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { addressId } = req.params;
    const { label, line1, line2, city, region, isDefault } = req.body;

    const address = await prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({ where: { id: addressId, userId } });
      if (!existing) throw new Error('Address not found');

      if (isDefault && !existing.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: { label, line1, line2, city, region, isDefault }
      });
    });

    res.status(200).json({ success: true, message: 'Address updated', data: address });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, data: null });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { addressId } = req.params;

    const existing = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found', data: null });
      return;
    }

    await prisma.address.delete({ where: { id: addressId } });

    res.status(200).json({ success: true, message: 'Address deleted', data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { addressId } = req.params;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({ where: { id: addressId, userId } });
      if (!existing) throw new Error('Address not found');

      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });

      await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true }
      });
    });

    res.status(200).json({ success: true, message: 'Default address updated', data: null });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message, data: null });
  }
};
