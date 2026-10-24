import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';

import authRoutes from './server/src/routes/auth';
import productRoutes from './server/src/routes/products';
import categoryRoutes from './server/src/routes/categories';
import cartRoutes from './server/src/routes/cart';
import orderRoutes from './server/src/routes/orders';
import userRoutes from './server/src/routes/users';
import devRoutes from './server/src/routes/dev';
import adminRoutes from './server/src/routes/admin';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'src', 'uploads')));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'MarketDash API is running' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);
  
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api/dev', devRoutes);
  }
  
  app.use('/api/admin', adminRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
