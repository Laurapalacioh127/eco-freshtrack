import express from 'express';
import cors from 'cors';
import { NODE_ENV, PORT } from './config';
import { initDb } from './db/db';
import { cleanupSeedDataDb, normalizeLegacyCategoriesDb } from './db/cleanup';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';
import { router as authRouter } from './features/auth/auth.router';
import { router as barcodeRouter } from './features/barcode/barcode.router';
import { router as productsRouter } from './features/products/product.router';
import { router as inventoryRouter } from './features/inventory/inventory.router';
import { router as recipesRouter } from './features/recipes/recipe.router';
import { router as donationsRouter } from './features/donations/donation.router';
import { router as notificationsRouter } from './features/notifications/notification.router';
import { router as usersRouter } from './features/users/user.router';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('FreshTrack API');
});

// Public routes
app.use('/api/auth', authRouter);

// Protected routes: authMiddleware is attached per router on its own prefix (never
// globally), so it only runs for these paths. Role checks live in each router.
// Mounted before /api/products so the barcode lookup is not shadowed and auth runs once.
app.use('/api/products/barcode', authMiddleware, barcodeRouter);
app.use('/api/products', authMiddleware, productsRouter);
app.use('/api/inventory', authMiddleware, inventoryRouter);
app.use('/api/recipes', authMiddleware, recipesRouter);
app.use('/api/donations', authMiddleware, donationsRouter);
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/notifications', authMiddleware, notificationsRouter);

// Error handling middleware
app.use(errorsMiddleware);

if (NODE_ENV !== 'production' && NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log('Server is running on http://localhost:' + PORT);

    try {
      await initDb();
      await cleanupSeedDataDb();
      await normalizeLegacyCategoriesDb();
    } catch (error) {
      console.error('Database init failed', error);
    }
  });
}

export default app;