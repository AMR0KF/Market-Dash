import { Request, Response } from 'express';
import { prisma } from '../prisma/index';

export const seedDummyData = async (req: Request, res: Response) => {
  try {
    // Clean up existing data (in correct order to avoid foreign key constraints)
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    // 1. Create Categories
    const produce = await prisma.category.create({ data: { name: 'Fresh Produce', slug: 'fresh-produce', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80' } });
    const dairy = await prisma.category.create({ data: { name: 'Dairy & Eggs', slug: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80' } });
    const meat = await prisma.category.create({ data: { name: 'Meat & Seafood', slug: 'meat-seafood', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80' } });
    const snacks = await prisma.category.create({ data: { name: 'Snacks', slug: 'snacks', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80' } });
    const beverages = await prisma.category.create({ data: { name: 'Beverages', slug: 'beverages', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' } });

    // 2. Create Products
    const products = [
      // Produce
      {
        name: 'Organic Bananas',
        description: 'Fresh organic bananas, perfect for snacking or smoothies.',
        price: 2.99,
        sku: 'PROD-BANANA-01',
        stock: 150,
        unit: '1 bunch',
        categoryId: produce.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80']),
        isFeatured: true
      },
      {
        name: 'Red Apples',
        description: 'Crisp and sweet red apples.',
        price: 4.50,
        compareAtPrice: 5.00,
        sku: 'PROD-APPLE-01',
        stock: 200,
        unit: '1 kg',
        categoryId: produce.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&w=800&q=80']),
        isFeatured: true
      },
      {
        name: 'Hass Avocados',
        description: 'Creamy Hass avocados, ripe and ready to eat.',
        price: 1.99,
        sku: 'PROD-AVO-01',
        stock: 80,
        unit: '1 piece',
        categoryId: produce.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80'])
      },
      // Dairy
      {
        name: 'Whole Milk',
        description: 'Farm fresh whole milk.',
        price: 3.49,
        sku: 'DAIRY-MILK-01',
        stock: 50,
        unit: '1 Gallon',
        categoryId: dairy.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80']),
        isFeatured: true
      },
      {
        name: 'Free Range Eggs',
        description: 'Dozen large free-range brown eggs.',
        price: 5.99,
        sku: 'DAIRY-EGG-01',
        stock: 100,
        unit: '1 Dozen',
        categoryId: dairy.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=800&q=80'])
      },
      {
        name: 'Cheddar Cheese',
        description: 'Sharp cheddar cheese block.',
        price: 6.50,
        sku: 'DAIRY-CHEESE-01',
        stock: 40,
        unit: '250g',
        categoryId: dairy.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1618164436241-4473940d1fce?auto=format&fit=crop&w=800&q=80'])
      },
      // Meat
      {
        name: 'Chicken Breast',
        description: 'Boneless, skinless chicken breasts.',
        price: 9.99,
        sku: 'MEAT-CHICK-01',
        stock: 60,
        unit: '1 kg',
        categoryId: meat.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80'])
      },
      {
        name: 'Fresh Salmon Fillet',
        description: 'Wild-caught Atlantic salmon fillet.',
        price: 14.99,
        compareAtPrice: 16.99,
        sku: 'MEAT-SALMON-01',
        stock: 30,
        unit: '500g',
        categoryId: meat.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=800&q=80']),
        isFeatured: true
      },
      // Snacks
      {
        name: 'Potato Chips',
        description: 'Classic salted potato chips.',
        price: 2.50,
        sku: 'SNACK-CHIP-01',
        stock: 200,
        unit: '150g',
        categoryId: snacks.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80'])
      },
      {
        name: 'Dark Chocolate Bar',
        description: '70% cocoa dark chocolate.',
        price: 3.99,
        sku: 'SNACK-CHOC-01',
        stock: 120,
        unit: '100g',
        categoryId: snacks.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80'])
      },
      // Beverages
      {
        name: 'Spring Water',
        description: 'Natural spring water.',
        price: 1.00,
        sku: 'BEV-WATER-01',
        stock: 500,
        unit: '1.5L',
        categoryId: beverages.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80'])
      },
      {
        name: 'Orange Juice',
        description: '100% pure squeezed orange juice.',
        price: 4.50,
        sku: 'BEV-OJ-01',
        stock: 80,
        unit: '1L',
        categoryId: beverages.id,
        images: JSON.stringify(['https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80']),
        isFeatured: true
      }
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
    }

    res.json({ success: true, message: 'Dummy data seeded successfully' });
  } catch (error: any) {
    console.error('Error seeding data:', error);
    res.status(500).json({ success: false, message: 'Failed to seed data', error: error.message });
  }
};

export const clearDummyData = async (req: Request, res: Response) => {
  try {
    // Delete in order to respect foreign keys
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    res.json({ success: true, message: 'Dummy data cleared successfully' });
  } catch (error: any) {
    console.error('Error clearing data:', error);
    res.status(500).json({ success: false, message: 'Failed to clear data', error: error.message });
  }
};
