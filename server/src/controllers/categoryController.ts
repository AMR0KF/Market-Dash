import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        },
        products: {
          where: { isActive: true },
          take: 10
        }
      }
    });

    const parsedCategories = categories.map(cat => ({
      ...cat,
      products: cat.products.map(p => ({
        ...p,
        images: p.images ? JSON.parse(p.images as any) : []
      }))
    }));

    res.status(200).json({ success: true, message: 'Categories retrieved', data: parsedCategories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const getCategoryWithProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true }
        }
      }
    });

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found', data: null });
      return;
    }

    res.status(200).json({ success: true, message: 'Category retrieved', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, image, parentId } = req.body;

    const category = await prisma.category.create({
      data: { name, slug, image, parentId }
    });

    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, image, parentId } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, image, parentId }
    });

    res.status(200).json({ success: true, message: 'Category updated', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Category deleted', data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};
