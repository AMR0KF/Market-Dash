import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean up existing data (in correct order to avoid foreign key constraints)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 1. Categories
  const produce = await prisma.category.create({
    data: { name: 'Produce', slug: 'produce', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400' }
  });
  const dairy = await prisma.category.create({
    data: { name: 'Dairy & Eggs', slug: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=400' }
  });
  const meat = await prisma.category.create({
    data: { name: 'Meat & Seafood', slug: 'meat-seafood', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=400' }
  });
  const bakery = await prisma.category.create({
    data: { name: 'Bakery', slug: 'bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' }
  });
  const pantry = await prisma.category.create({
    data: { name: 'Pantry', slug: 'pantry', image: 'https://images.unsplash.com/photo-1584285418504-03f57871b695?auto=format&fit=crop&q=80&w=400' }
  });

  // 2. Products
  const products = [
    // Produce
    { name: 'Organic Bananas', description: 'Fresh organic bananas', price: 2.99, sku: 'PROD-001', stock: 100, unit: 'bunch', categoryId: produce.id, images: JSON.stringify(['https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Honeycrisp Apples', description: 'Crisp and sweet apples', price: 4.99, sku: 'PROD-002', stock: 150, unit: 'lb', categoryId: produce.id, images: JSON.stringify(['https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Baby Spinach', description: 'Pre-washed baby spinach', price: 3.49, sku: 'PROD-003', stock: 80, unit: 'pack', categoryId: produce.id, images: JSON.stringify(['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Carrots', description: 'Organic whole carrots', price: 1.99, sku: 'PROD-004', stock: 200, unit: 'lb', categoryId: produce.id, images: JSON.stringify(['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400']) },
    
    // Dairy
    { name: 'Whole Milk', description: '1 Gallon Whole Milk', price: 3.99, sku: 'DAI-001', stock: 50, unit: 'gallon', categoryId: dairy.id, images: JSON.stringify(['https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Large Brown Eggs', description: 'Dozen free-range eggs', price: 5.49, sku: 'DAI-002', stock: 60, unit: 'dozen', categoryId: dairy.id, images: JSON.stringify(['https://images.unsplash.com/photo-1587486913049-53fc88980bfc?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Salted Butter', description: 'Sweet cream salted butter', price: 4.29, sku: 'DAI-003', stock: 80, unit: 'lb', categoryId: dairy.id, images: JSON.stringify(['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Cheddar Cheese', description: 'Sharp cheddar cheese block', price: 6.99, sku: 'DAI-004', stock: 40, unit: 'block', categoryId: dairy.id, images: JSON.stringify(['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400']) },
    
    // Meat
    { name: 'Chicken Breast', description: 'Boneless skinless chicken breasts', price: 9.99, sku: 'MEA-001', stock: 30, unit: 'lb', categoryId: meat.id, images: JSON.stringify(['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Ground Beef 80/20', description: '80% lean ground beef', price: 7.49, sku: 'MEA-002', stock: 45, unit: 'lb', categoryId: meat.id, images: JSON.stringify(['https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Atlantic Salmon', description: 'Fresh farm-raised salmon fillet', price: 12.99, sku: 'MEA-003', stock: 20, unit: 'lb', categoryId: meat.id, images: JSON.stringify(['https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Bacon', description: 'Thick cut smoked bacon', price: 8.99, sku: 'MEA-004', stock: 55, unit: 'pack', categoryId: meat.id, images: JSON.stringify(['https://images.unsplash.com/photo-1606851094655-b25cb7a6062a?auto=format&fit=crop&q=80&w=400']) },
    
    // Bakery
    { name: 'Sourdough Loaf', description: 'Fresh baked artisan sourdough', price: 5.99, sku: 'BAK-001', stock: 25, unit: 'loaf', categoryId: bakery.id, images: JSON.stringify(['https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Butter Croissants', description: 'Pack of 4 butter croissants', price: 4.99, sku: 'BAK-002', stock: 30, unit: 'pack', categoryId: bakery.id, images: JSON.stringify(['https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Plain Bagels', description: 'Pack of 6 plain bagels', price: 3.99, sku: 'BAK-003', stock: 40, unit: 'pack', categoryId: bakery.id, images: JSON.stringify(['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Chocolate Chip Cookies', description: 'Fresh baked cookies', price: 4.49, sku: 'BAK-004', stock: 50, unit: 'pack', categoryId: bakery.id, images: JSON.stringify(['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400']) },
    
    // Pantry
    { name: 'Extra Virgin Olive Oil', description: 'Cold pressed olive oil', price: 14.99, sku: 'PAN-001', stock: 60, unit: 'bottle', categoryId: pantry.id, images: JSON.stringify(['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Spaghetti Pasta', description: 'Enriched macaroni product', price: 1.99, sku: 'PAN-002', stock: 120, unit: 'box', categoryId: pantry.id, images: JSON.stringify(['https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Jasmine Rice', description: 'Thai fragrant long grain rice', price: 8.99, sku: 'PAN-003', stock: 40, unit: 'bag', categoryId: pantry.id, images: JSON.stringify(['https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=400']) },
    { name: 'Whole Bean Coffee', description: 'Medium roast arabica coffee', price: 11.99, sku: 'PAN-004', stock: 75, unit: 'bag', categoryId: pantry.id, images: JSON.stringify(['https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=400']) },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
