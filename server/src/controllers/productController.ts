import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, minPrice, maxPrice, inStock, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };

    if (category) where.categoryId = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
    if (inStock === 'true') where.stock = { gt: 0 };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const parsedProducts = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));

    res.status(200).json({
      success: true,
      message: 'Products retrieved',
      data: {
        data: parsedProducts,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!product || !product.isActive) {
      res.status(404).json({ success: false, message: 'Product not found', data: null });
      return;
    }

    const parsedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    };

    res.status(200).json({ success: true, message: 'Product retrieved', data: parsedProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      take: 10
    });

    const parsedProducts = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));

    res.status(200).json({ success: true, message: 'Featured products retrieved', data: parsedProducts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query) {
      res.status(400).json({ success: false, message: 'Search query is required', data: null });
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query as string } },
          { description: { contains: query as string } },
          { sku: { contains: query as string } }
        ]
      },
      include: { category: true },
      take: 20
    });

    const parsedProducts = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));

    res.status(200).json({ success: true, message: 'Search results retrieved', data: parsedProducts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, compareAtPrice, sku, barcode, stock, unit, images, categoryId, isActive, isFeatured, weight } = req.body;

    const product = await prisma.product.create({
      data: {
        name, description, price, compareAtPrice, sku, barcode, stock, unit, images, categoryId, isActive, isFeatured, weight
      }
    });

    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, compareAtPrice, sku, barcode, stock, unit, images, categoryId, isActive, isFeatured, weight } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name, description, price, compareAtPrice, sku, barcode, stock, unit, images, categoryId, isActive, isFeatured, weight
      }
    });

    res.status(200).json({ success: true, message: 'Product updated', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(200).json({ success: true, message: 'Product soft deleted', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

export const uploadProductImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded', data: null });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const fileUrls = files.map(file => `/uploads/${file.filename}`);

    res.status(200).json({ success: true, message: 'Images uploaded successfully', data: fileUrls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};
