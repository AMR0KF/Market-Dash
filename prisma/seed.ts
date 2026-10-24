import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for MarketDash...');

  // 1. Clean up existing data in correct FK order
  console.log('Cleaning up existing tables...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 2. Categories
  console.log('Creating categories...');
  const catProduce = await prisma.category.create({
    data: {
      id: 'cat-produce',
      name: 'Fresh Produce',
      slug: 'fresh-produce',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80'
    }
  });

  const catDairy = await prisma.category.create({
    data: {
      id: 'cat-dairy',
      name: 'Dairy & Eggs',
      slug: 'dairy-eggs',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80'
    }
  });

  const catMeat = await prisma.category.create({
    data: {
      id: 'cat-meat',
      name: 'Meat & Seafood',
      slug: 'meat-seafood',
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80'
    }
  });

  const catBakery = await prisma.category.create({
    data: {
      id: 'cat-bakery',
      name: 'Bakery',
      slug: 'bakery',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
    }
  });

  const catPantry = await prisma.category.create({
    data: {
      id: 'cat-pantry',
      name: 'Pantry',
      slug: 'pantry',
      image: 'https://images.unsplash.com/photo-1584285418504-03f57871b695?auto=format&fit=crop&w=600&q=80'
    }
  });

  const catSnacks = await prisma.category.create({
    data: {
      id: 'cat-snacks',
      name: 'Snacks',
      slug: 'snacks',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=600&q=80'
    }
  });

  const catBeverages = await prisma.category.create({
    data: {
      id: 'cat-beverages',
      name: 'Beverages',
      slug: 'beverages',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
    }
  });

  // 3. Products
  console.log('Creating catalog products...');
  const products = [
    // Produce
    {
      id: 'prod-banana',
      name: 'Organic Bananas',
      description: 'Sweet and nutritious organic Cavendish bananas. Freshly harvested.',
      price: 2.99,
      compareAtPrice: 3.49,
      sku: 'PROD-BAN-001',
      stock: 150,
      unit: '1 bunch',
      categoryId: catProduce.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-apple',
      name: 'Honeycrisp Apples',
      description: 'Extra crisp and sweet Honeycrisp apples, ideal for snacking and baking.',
      price: 4.50,
      compareAtPrice: 5.20,
      sku: 'PROD-APP-002',
      stock: 120,
      unit: '1 kg',
      categoryId: catProduce.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-spinach',
      name: 'Baby Spinach',
      description: 'Triple-washed organic tender baby spinach leaves, packed with nutrients.',
      price: 3.49,
      sku: 'PROD-SPN-003',
      stock: 80,
      unit: 'pack (300g)',
      categoryId: catProduce.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-avocado',
      name: 'Hass Avocados',
      description: 'Creamy Hass avocados, perfectly ripe and ready for guacamole or toast.',
      price: 1.99,
      compareAtPrice: 2.50,
      sku: 'PROD-AVO-004',
      stock: 4, // Low stock for dashboard alert!
      unit: '1 piece',
      categoryId: catProduce.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-carrots',
      name: 'Organic Whole Carrots',
      description: 'Crunchy sweet farm-grown whole carrots with rich beta-carotene.',
      price: 2.19,
      sku: 'PROD-CAR-005',
      stock: 95,
      unit: '1 kg bag',
      categoryId: catProduce.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-berries',
      name: 'Fresh Blueberries',
      description: 'Plump and juicy antioxidant-rich blueberries.',
      price: 4.99,
      sku: 'PROD-BER-006',
      stock: 50,
      unit: '250g clamshell',
      categoryId: catProduce.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80'])
    },

    // Dairy & Eggs
    {
      id: 'prod-milk',
      name: 'Whole Milk Grade A',
      description: 'Rich and creamy farm fresh whole milk pasteurized to perfection.',
      price: 3.49,
      sku: 'DAI-MLK-001',
      stock: 90,
      unit: '1 Gallon',
      categoryId: catDairy.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-eggs',
      name: 'Free Range Large Brown Eggs',
      description: 'Farm-fresh free range brown eggs from pasture-raised hens.',
      price: 5.99,
      sku: 'DAI-EGG-002',
      stock: 75,
      unit: '1 Dozen',
      categoryId: catDairy.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-butter',
      name: 'Salted Sweet Cream Butter',
      description: 'Traditional slow-churned sweet cream salted butter.',
      price: 4.29,
      sku: 'DAI-BUT-003',
      stock: 60,
      unit: '1 lb block',
      categoryId: catDairy.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-cheese',
      name: 'Sharp Cheddar Cheese',
      description: 'Aged 12 months for a bold, savory bite. Excellent meltability.',
      price: 6.50,
      sku: 'DAI-CHE-004',
      stock: 45,
      unit: '250g block',
      categoryId: catDairy.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1618164436241-4473940d1fce?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-yogurt',
      name: 'Greek Plain Yogurt',
      description: 'Authentic strained thick Greek yogurt with probiotics.',
      price: 4.19,
      sku: 'DAI-YOG-005',
      stock: 40,
      unit: '500g tub',
      categoryId: catDairy.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-almond-milk',
      name: 'Unsweetened Almond Milk',
      description: 'Plant-based creamy almond milk, vitamin enriched.',
      price: 4.99,
      sku: 'DAI-ALM-006',
      stock: 2, // Low stock alert!
      unit: '1L carton',
      categoryId: catDairy.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1568651316824-e22137682283?auto=format&fit=crop&w=600&q=80'])
    },

    // Meat & Seafood
    {
      id: 'prod-chicken',
      name: 'Boneless Skinless Chicken Breast',
      description: 'All-natural, hormone-free chicken breasts trimmed and ready to cook.',
      price: 9.99,
      sku: 'MEA-CHK-001',
      stock: 40,
      unit: '1 kg pack',
      categoryId: catMeat.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-salmon',
      name: 'Fresh Atlantic Salmon Fillet',
      description: 'Wild-caught fresh Atlantic salmon fillet, tender and rich in omega-3.',
      price: 14.99,
      compareAtPrice: 17.50,
      sku: 'MEA-SLM-002',
      stock: 3, // Low stock alert!
      unit: '500g fillet',
      categoryId: catMeat.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-beef',
      name: 'Ground Beef 80/20',
      description: '100% pure premium beef, perfect ratio for juicy burgers and meatballs.',
      price: 7.49,
      sku: 'MEA-BEF-003',
      stock: 35,
      unit: '1 lb tray',
      categoryId: catMeat.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-bacon',
      name: 'Thick Cut Smoked Bacon',
      description: 'Applewood smoked cured bacon cut thick for maximum crispiness.',
      price: 8.99,
      sku: 'MEA-BAC-004',
      stock: 50,
      unit: '375g pack',
      categoryId: catMeat.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1606851094655-b25cb7a6062a?auto=format&fit=crop&w=600&q=80'])
    },

    // Bakery
    {
      id: 'prod-sourdough',
      name: 'Artisan Sourdough Loaf',
      description: 'Naturally fermented with a golden crust and chewy, airy crumb.',
      price: 5.99,
      sku: 'BAK-SRD-001',
      stock: 25,
      unit: '1 loaf',
      categoryId: catBakery.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-croissant',
      name: 'All-Butter Croissants (4-Pack)',
      description: 'Flaky, buttery French-style croissants baked fresh every morning.',
      price: 4.99,
      sku: 'BAK-CRO-002',
      stock: 30,
      unit: 'pack of 4',
      categoryId: catBakery.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-bagel',
      name: 'Plain Bagels (6-Pack)',
      description: 'Boiled and baked New York style bagels with a golden exterior.',
      price: 3.99,
      sku: 'BAK-BAG-003',
      stock: 40,
      unit: 'pack of 6',
      categoryId: catBakery.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-cookies',
      name: 'Chocolate Chip Cookies',
      description: 'Soft-baked cookies packed with premium Belgian dark chocolate chips.',
      price: 4.49,
      sku: 'BAK-COK-004',
      stock: 50,
      unit: 'pack of 8',
      categoryId: catBakery.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80'])
    },

    // Pantry
    {
      id: 'prod-olive-oil',
      name: 'Extra Virgin Olive Oil',
      description: 'First cold-pressed Mediterranean olive oil with a fruity aroma.',
      price: 14.99,
      sku: 'PAN-OIL-001',
      stock: 60,
      unit: '750ml bottle',
      categoryId: catPantry.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },
    {
      id: 'prod-pasta',
      name: 'Spaghetti Pasta Bronze-Cut',
      description: 'Traditional Italian durum wheat semolina spaghetti.',
      price: 1.99,
      sku: 'PAN-PAS-002',
      stock: 120,
      unit: '500g box',
      categoryId: catPantry.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-rice',
      name: 'Fragrant Jasmine Rice',
      description: 'Naturally aromatic long-grain white jasmine rice from Thailand.',
      price: 8.99,
      sku: 'PAN-RIC-003',
      stock: 40,
      unit: '2 kg bag',
      categoryId: catPantry.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-coffee',
      name: 'Whole Bean Arabica Coffee',
      description: 'Medium-dark roast whole bean specialty coffee with notes of caramel.',
      price: 11.99,
      sku: 'PAN-COF-004',
      stock: 75,
      unit: '350g bag',
      categoryId: catPantry.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },

    // Snacks
    {
      id: 'prod-chips',
      name: 'Classic Sea Salt Potato Chips',
      description: 'Hand-cooked kettle chips crisped to golden perfection with sea salt.',
      price: 2.50,
      sku: 'SNK-CHP-001',
      stock: 200,
      unit: '150g bag',
      categoryId: catSnacks.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-chocolate',
      name: '70% Dark Chocolate Bar',
      description: 'Rich dark chocolate crafted with single-origin fair trade cocoa.',
      price: 3.99,
      sku: 'SNK-CHO-002',
      stock: 120,
      unit: '100g bar',
      categoryId: catSnacks.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    },

    // Beverages
    {
      id: 'prod-water',
      name: 'Pure Natural Spring Water',
      description: 'Crisp, refreshing natural mineral spring water bottled at the source.',
      price: 1.00,
      sku: 'BEV-WAT-001',
      stock: 500,
      unit: '1.5L bottle',
      categoryId: catBeverages.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80'])
    },
    {
      id: 'prod-oj',
      name: '100% Squeezed Orange Juice',
      description: 'No added sugar, never from concentrate. Pure freshly squeezed oranges.',
      price: 4.50,
      sku: 'BEV-OJ-002',
      stock: 80,
      unit: '1L bottle',
      categoryId: catBeverages.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80']),
      isFeatured: true
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // 4. Create Users & Admin
  console.log('Creating users and admin...');
  const userAlex = await prisma.user.create({
    data: {
      id: 'user-alex-morgan',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      passwordHash: defaultPasswordHash,
      phone: '+1 (555) 234-5678'
    }
  });

  const userSarah = await prisma.user.create({
    data: {
      id: 'user-sarah-connor',
      name: 'Sarah Connor',
      email: 'sarah.c@cyberdyne.io',
      passwordHash: defaultPasswordHash,
      phone: '+1 (555) 890-1234'
    }
  });

  const userMichael = await prisma.user.create({
    data: {
      id: 'user-michael-scott',
      name: 'Michael Scott',
      email: 'm.scott@dundermifflin.com',
      passwordHash: defaultPasswordHash,
      phone: '+1 (555) 432-8765'
    }
  });

  const userEmma = await prisma.user.create({
    data: {
      id: 'user-emma-watson',
      name: 'Emma Watson',
      email: 'emma.w@oxford.edu',
      passwordHash: defaultPasswordHash,
      phone: '+1 (555) 678-9012'
    }
  });

  const userDavid = await prisma.user.create({
    data: {
      id: 'user-david-miller',
      name: 'David Miller',
      email: 'david.miller@techcorp.com',
      passwordHash: defaultPasswordHash,
      phone: '+1 (555) 345-6789'
    }
  });

  const userLisa = await prisma.user.create({
    data: {
      id: 'user-lisa-simpson',
      name: 'Lisa Simpson',
      email: 'lisa.s@springfield.org',
      passwordHash: defaultPasswordHash,
      phone: '+1 (555) 901-2345'
    }
  });

  // Admin User
  await prisma.adminUser.create({
    data: {
      id: 'admin-super',
      email: 'admin@marketdash.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN'
    }
  });

  // 5. Addresses
  console.log('Creating addresses...');
  const addrAlexHome = await prisma.address.create({
    data: {
      id: 'addr-alex-home',
      userId: userAlex.id,
      label: 'Home',
      line1: '742 Evergreen Terrace',
      line2: 'Apt 4B',
      city: 'Springfield',
      region: 'OR 97477',
      isDefault: true
    }
  });

  const addrAlexOffice = await prisma.address.create({
    data: {
      id: 'addr-alex-office',
      userId: userAlex.id,
      label: 'Office HQ',
      line1: '100 Innovation Way',
      line2: 'Suite 300',
      city: 'Silicon Valley',
      region: 'CA 94025',
      isDefault: false
    }
  });

  const addrAlexBeach = await prisma.address.create({
    data: {
      id: 'addr-alex-beach',
      userId: userAlex.id,
      label: 'Beach House',
      line1: '45 Ocean Drive',
      city: 'Malibu',
      region: 'CA 90265',
      isDefault: false
    }
  });

  const addrSarah = await prisma.address.create({
    data: {
      id: 'addr-sarah-1',
      userId: userSarah.id,
      label: 'Safehouse HQ',
      line1: '1200 Industrial Blvd',
      city: 'Los Angeles',
      region: 'CA 90001',
      isDefault: true
    }
  });

  const addrMichael = await prisma.address.create({
    data: {
      id: 'addr-michael-1',
      userId: userMichael.id,
      label: 'Dunder Mifflin Office',
      line1: '1725 Slough Avenue',
      city: 'Scranton',
      region: 'PA 18503',
      isDefault: true
    }
  });

  const addrEmma = await prisma.address.create({
    data: {
      id: 'addr-emma-1',
      userId: userEmma.id,
      label: 'Townhouse',
      line1: '42 Kensington Park Gardens',
      city: 'London',
      region: 'W11 2QT',
      isDefault: true
    }
  });

  const addrDavid = await prisma.address.create({
    data: {
      id: 'addr-david-1',
      userId: userDavid.id,
      label: 'Highrise Apt',
      line1: '88 Pine Street',
      line2: 'Floor 12',
      city: 'Seattle',
      region: 'WA 98101',
      isDefault: true
    }
  });

  const addrLisa = await prisma.address.create({
    data: {
      id: 'addr-lisa-1',
      userId: userLisa.id,
      label: 'University Dorm',
      line1: '500 Campus Walk',
      city: 'Springfield',
      region: 'OR 97477',
      isDefault: true
    }
  });

  // 6. Pre-populate Cart for Alex Morgan
  console.log('Populating active cart for Alex Morgan...');
  const alexCart = await prisma.cart.create({
    data: {
      id: 'cart-alex',
      userId: userAlex.id
    }
  });

  await prisma.cartItem.createMany({
    data: [
      { cartId: alexCart.id, productId: 'prod-avocado', quantity: 2 },
      { cartId: alexCart.id, productId: 'prod-salmon', quantity: 1 },
      { cartId: alexCart.id, productId: 'prod-sourdough', quantity: 1 }
    ]
  });

  // 7. Orders & Order Items
  console.log('Creating realistic orders across statuses...');
  const now = new Date();

  // Helper for dates relative to now
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
  const daysAgo = (d: number, hoursOffset = 2) => new Date(now.getTime() - (d * 24 + hoursOffset) * 60 * 60 * 1000);

  // --- Orders for Alex Morgan (Storefront customer) ---

  // Order 1: OUT_FOR_DELIVERY (Today, 2 hours ago)
  await prisma.order.create({
    data: {
      id: 'ord-alex-101',
      userId: userAlex.id,
      addressId: addrAlexHome.id,
      status: 'OUT_FOR_DELIVERY',
      subtotal: 16.96,
      deliveryFee: 5.00,
      total: 21.96,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      notes: 'Please ring the bell and leave on the front porch table.',
      createdAt: hoursAgo(2),
      items: {
        create: [
          { productId: 'prod-banana', quantity: 2, unitPrice: 2.99, totalPrice: 5.98 },
          { productId: 'prod-milk', quantity: 1, unitPrice: 3.49, totalPrice: 3.49 },
          { productId: 'prod-eggs', quantity: 1, unitPrice: 5.99, totalPrice: 5.99 },
          { productId: 'prod-water', quantity: 1, unitPrice: 1.50, totalPrice: 1.50 }
        ]
      }
    }
  });

  // Order 2: PREPARING (Today, 4 hours ago)
  await prisma.order.create({
    data: {
      id: 'ord-alex-102',
      userId: userAlex.id,
      addressId: addrAlexOffice.id,
      status: 'PREPARING',
      subtotal: 42.95,
      deliveryFee: 5.00,
      total: 47.95,
      paymentMethod: 'WHISH',
      paymentStatus: 'PAID',
      notes: 'Office reception delivery. Please ask for Alex Morgan on Floor 3.',
      createdAt: hoursAgo(4),
      items: {
        create: [
          { productId: 'prod-salmon', quantity: 1, unitPrice: 14.99, totalPrice: 14.99 },
          { productId: 'prod-olive-oil', quantity: 1, unitPrice: 14.99, totalPrice: 14.99 },
          { productId: 'prod-rice', quantity: 1, unitPrice: 8.99, totalPrice: 8.99 },
          { productId: 'prod-avocado', quantity: 2, unitPrice: 1.99, totalPrice: 3.98 }
        ]
      }
    }
  });

  // Order 3: PENDING (Today, 30 minutes ago - user can test Cancel button!)
  await prisma.order.create({
    data: {
      id: 'ord-alex-103',
      userId: userAlex.id,
      addressId: addrAlexHome.id,
      status: 'PENDING',
      subtotal: 22.47,
      deliveryFee: 5.00,
      total: 27.47,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      notes: 'Call upon arrival if the front gate is locked.',
      createdAt: hoursAgo(0.5),
      items: {
        create: [
          { productId: 'prod-beef', quantity: 1, unitPrice: 7.49, totalPrice: 7.49 },
          { productId: 'prod-cheese', quantity: 1, unitPrice: 6.50, totalPrice: 6.50 },
          { productId: 'prod-chips', quantity: 2, unitPrice: 2.50, totalPrice: 5.00 },
          { productId: 'prod-chocolate', quantity: 1, unitPrice: 3.48, totalPrice: 3.48 }
        ]
      }
    }
  });

  // Order 4: DELIVERED (3 days ago - large $70+ order with Free delivery)
  await prisma.order.create({
    data: {
      id: 'ord-alex-104',
      userId: userAlex.id,
      addressId: addrAlexHome.id,
      status: 'DELIVERED',
      subtotal: 78.43,
      deliveryFee: 0.00, // Free delivery for orders >= 50
      total: 78.43,
      paymentMethod: 'OMT',
      paymentStatus: 'PAID',
      notes: 'Gate code #4421. Thank you!',
      createdAt: daysAgo(3, 1),
      items: {
        create: [
          { productId: 'prod-chicken', quantity: 2, unitPrice: 9.99, totalPrice: 19.98 },
          { productId: 'prod-salmon', quantity: 1, unitPrice: 14.99, totalPrice: 14.99 },
          { productId: 'prod-coffee', quantity: 1, unitPrice: 11.99, totalPrice: 11.99 },
          { productId: 'prod-butter', quantity: 2, unitPrice: 4.29, totalPrice: 8.58 },
          { productId: 'prod-apple', quantity: 2, unitPrice: 4.50, totalPrice: 9.00 },
          { productId: 'prod-croissant', quantity: 2, unitPrice: 4.99, totalPrice: 9.98 },
          { productId: 'prod-pasta', quantity: 2, unitPrice: 1.95, totalPrice: 3.91 }
        ]
      }
    }
  });

  // Order 5: DELIVERED (6 days ago - breakfast & bakery order)
  await prisma.order.create({
    data: {
      id: 'ord-alex-105',
      userId: userAlex.id,
      addressId: addrAlexBeach.id,
      status: 'DELIVERED',
      subtotal: 31.95,
      deliveryFee: 5.00,
      total: 36.95,
      paymentMethod: 'WHISH',
      paymentStatus: 'PAID',
      notes: 'Beach house drop off at side door.',
      createdAt: daysAgo(6, 4),
      items: {
        create: [
          { productId: 'prod-sourdough', quantity: 2, unitPrice: 5.99, totalPrice: 11.98 },
          { productId: 'prod-croissant', quantity: 1, unitPrice: 4.99, totalPrice: 4.99 },
          { productId: 'prod-bagel', quantity: 1, unitPrice: 3.99, totalPrice: 3.99 },
          { productId: 'prod-oj', quantity: 1, unitPrice: 4.50, totalPrice: 4.50 },
          { productId: 'prod-cookies', quantity: 1, unitPrice: 4.49, totalPrice: 4.49 },
          { productId: 'prod-water', quantity: 2, unitPrice: 1.00, totalPrice: 2.00 }
        ]
      }
    }
  });

  // Order 6: CANCELLED (12 days ago)
  await prisma.order.create({
    data: {
      id: 'ord-alex-106',
      userId: userAlex.id,
      addressId: addrAlexHome.id,
      status: 'CANCELLED',
      subtotal: 17.96,
      deliveryFee: 5.00,
      total: 22.96,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'CANCELLED',
      notes: 'Customer called to cancel before preparation.',
      createdAt: daysAgo(12, 5),
      items: {
        create: [
          { productId: 'prod-chips', quantity: 4, unitPrice: 2.50, totalPrice: 10.00 },
          { productId: 'prod-chocolate', quantity: 2, unitPrice: 3.98, totalPrice: 7.96 }
        ]
      }
    }
  });

  // --- Orders for other customers (to populate Admin Dashboard, Orders table, and Customer stats) ---

  // Sarah Connor orders
  await prisma.order.create({
    data: {
      id: 'ord-sarah-201',
      userId: userSarah.id,
      addressId: addrSarah.id,
      status: 'OUT_FOR_DELIVERY',
      subtotal: 62.45,
      deliveryFee: 0.00,
      total: 62.45,
      paymentMethod: 'WHISH',
      paymentStatus: 'PAID',
      createdAt: hoursAgo(1.5),
      items: {
        create: [
          { productId: 'prod-chicken', quantity: 3, unitPrice: 9.99, totalPrice: 29.97 },
          { productId: 'prod-beef', quantity: 2, unitPrice: 7.49, totalPrice: 14.98 },
          { productId: 'prod-rice', quantity: 1, unitPrice: 8.99, totalPrice: 8.99 },
          { productId: 'prod-water', quantity: 8, unitPrice: 1.06, totalPrice: 8.51 }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      id: 'ord-sarah-202',
      userId: userSarah.id,
      addressId: addrSarah.id,
      status: 'DELIVERED',
      subtotal: 110.50,
      deliveryFee: 0.00,
      total: 110.50,
      paymentMethod: 'OMT',
      paymentStatus: 'PAID',
      createdAt: daysAgo(2, 3),
      items: {
        create: [
          { productId: 'prod-coffee', quantity: 3, unitPrice: 11.99, totalPrice: 35.97 },
          { productId: 'prod-olive-oil', quantity: 2, unitPrice: 14.99, totalPrice: 29.98 },
          { productId: 'prod-salmon', quantity: 2, unitPrice: 14.99, totalPrice: 29.98 },
          { productId: 'prod-pasta', quantity: 7, unitPrice: 2.08, totalPrice: 14.57 }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      id: 'ord-sarah-203',
      userId: userSarah.id,
      addressId: addrSarah.id,
      status: 'DELIVERED',
      subtotal: 48.50,
      deliveryFee: 5.00,
      total: 53.50,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PAID',
      createdAt: daysAgo(5, 2),
      items: {
        create: [
          { productId: 'prod-bacon', quantity: 3, unitPrice: 8.99, totalPrice: 26.97 },
          { productId: 'prod-eggs', quantity: 2, unitPrice: 5.99, totalPrice: 11.98 },
          { productId: 'prod-oj', quantity: 2, unitPrice: 4.77, totalPrice: 9.55 }
        ]
      }
    }
  });

  // Michael Scott orders
  await prisma.order.create({
    data: {
      id: 'ord-michael-301',
      userId: userMichael.id,
      addressId: addrMichael.id,
      status: 'PENDING',
      subtotal: 35.40,
      deliveryFee: 5.00,
      total: 40.40,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      notes: 'Please bring to reception and say "That\'s what she said".',
      createdAt: hoursAgo(1),
      items: {
        create: [
          { productId: 'prod-cookies', quantity: 4, unitPrice: 4.49, totalPrice: 17.96 },
          { productId: 'prod-chocolate', quantity: 3, unitPrice: 3.99, totalPrice: 11.97 },
          { productId: 'prod-chips', quantity: 2, unitPrice: 2.73, totalPrice: 5.47 }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      id: 'ord-michael-302',
      userId: userMichael.id,
      addressId: addrMichael.id,
      status: 'CONFIRMED',
      subtotal: 54.90,
      deliveryFee: 0.00,
      total: 54.90,
      paymentMethod: 'OMT',
      paymentStatus: 'PAID',
      createdAt: daysAgo(1, 5),
      items: {
        create: [
          { productId: 'prod-bagel', quantity: 5, unitPrice: 3.99, totalPrice: 19.95 },
          { productId: 'prod-croissant', quantity: 4, unitPrice: 4.99, totalPrice: 19.96 },
          { productId: 'prod-butter', quantity: 2, unitPrice: 4.29, totalPrice: 8.58 },
          { productId: 'prod-oj', quantity: 1, unitPrice: 6.41, totalPrice: 6.41 }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      id: 'ord-michael-303',
      userId: userMichael.id,
      addressId: addrMichael.id,
      status: 'DELIVERED',
      subtotal: 82.30,
      deliveryFee: 0.00,
      total: 82.30,
      paymentMethod: 'WHISH',
      paymentStatus: 'PAID',
      createdAt: daysAgo(4, 2),
      items: {
        create: [
          { productId: 'prod-coffee', quantity: 4, unitPrice: 11.99, totalPrice: 47.96 },
          { productId: 'prod-milk', quantity: 4, unitPrice: 3.49, totalPrice: 13.96 },
          { productId: 'prod-cookies', quantity: 4, unitPrice: 5.09, totalPrice: 20.38 }
        ]
      }
    }
  });

  // Emma Watson orders
  await prisma.order.create({
    data: {
      id: 'ord-emma-401',
      userId: userEmma.id,
      addressId: addrEmma.id,
      status: 'PREPARING',
      subtotal: 28.45,
      deliveryFee: 5.00,
      total: 33.45,
      paymentMethod: 'WHISH',
      paymentStatus: 'PAID',
      createdAt: hoursAgo(3),
      items: {
        create: [
          { productId: 'prod-spinach', quantity: 2, unitPrice: 3.49, totalPrice: 6.98 },
          { productId: 'prod-berries', quantity: 2, unitPrice: 4.99, totalPrice: 9.98 },
          { productId: 'prod-yogurt', quantity: 2, unitPrice: 4.19, totalPrice: 8.38 },
          { productId: 'prod-water', quantity: 3, unitPrice: 1.03, totalPrice: 3.11 }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      id: 'ord-emma-402',
      userId: userEmma.id,
      addressId: addrEmma.id,
      status: 'DELIVERED',
      subtotal: 45.90,
      deliveryFee: 5.00,
      total: 50.90,
      paymentMethod: 'OMT',
      paymentStatus: 'PAID',
      createdAt: daysAgo(2, 6),
      items: {
        create: [
          { productId: 'prod-sourdough', quantity: 2, unitPrice: 5.99, totalPrice: 11.98 },
          { productId: 'prod-cheese', quantity: 2, unitPrice: 6.50, totalPrice: 13.00 },
          { productId: 'prod-apple', quantity: 3, unitPrice: 4.50, totalPrice: 13.50 },
          { productId: 'prod-butter', quantity: 1, unitPrice: 7.42, totalPrice: 7.42 }
        ]
      }
    }
  });

  // David Miller orders
  await prisma.order.create({
    data: {
      id: 'ord-david-501',
      userId: userDavid.id,
      addressId: addrDavid.id,
      status: 'DELIVERED',
      subtotal: 92.50,
      deliveryFee: 0.00,
      total: 92.50,
      paymentMethod: 'WHISH',
      paymentStatus: 'PAID',
      createdAt: daysAgo(1, 2),
      items: {
        create: [
          { productId: 'prod-salmon', quantity: 3, unitPrice: 14.99, totalPrice: 44.97 },
          { productId: 'prod-chicken', quantity: 2, unitPrice: 9.99, totalPrice: 19.98 },
          { productId: 'prod-olive-oil', quantity: 1, unitPrice: 14.99, totalPrice: 14.99 },
          { productId: 'prod-rice', quantity: 1, unitPrice: 12.56, totalPrice: 12.56 }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      id: 'ord-david-502',
      userId: userDavid.id,
      addressId: addrDavid.id,
      status: 'DELIVERED',
      subtotal: 64.20,
      deliveryFee: 0.00,
      total: 64.20,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PAID',
      createdAt: daysAgo(7, 3),
      items: {
        create: [
          { productId: 'prod-coffee', quantity: 2, unitPrice: 11.99, totalPrice: 23.98 },
          { productId: 'prod-beef', quantity: 3, unitPrice: 7.49, totalPrice: 22.47 },
          { productId: 'prod-bacon', quantity: 2, unitPrice: 8.87, totalPrice: 17.75 }
        ]
      }
    }
  });

  // Lisa Simpson orders
  await prisma.order.create({
    data: {
      id: 'ord-lisa-601',
      userId: userLisa.id,
      addressId: addrLisa.id,
      status: 'DELIVERED',
      subtotal: 26.50,
      deliveryFee: 5.00,
      total: 31.50,
      paymentMethod: 'OMT',
      paymentStatus: 'PAID',
      createdAt: daysAgo(3, 4),
      items: {
        create: [
          { productId: 'prod-apple', quantity: 2, unitPrice: 4.50, totalPrice: 9.00 },
          { productId: 'prod-carrots', quantity: 2, unitPrice: 2.19, totalPrice: 4.38 },
          { productId: 'prod-spinach', quantity: 2, unitPrice: 3.49, totalPrice: 6.98 },
          { productId: 'prod-oj', quantity: 1, unitPrice: 6.14, totalPrice: 6.14 }
        ]
      }
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('Summary:');
  console.log(`- Categories: ${await prisma.category.count()}`);
  console.log(`- Products: ${await prisma.product.count()}`);
  console.log(`- Users: ${await prisma.user.count()} (Primary: alex.morgan@example.com)`);
  console.log(`- Admin: ${await prisma.adminUser.count()} (admin@marketdash.com)`);
  console.log(`- Addresses: ${await prisma.address.count()}`);
  console.log(`- Orders: ${await prisma.order.count()}`);
  console.log(`- OrderItems: ${await prisma.orderItem.count()}`);
  console.log(`- CartItems: ${await prisma.cartItem.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
