import express from 'express';
import cors from 'cors';
import { NODE_ENV, PORT } from './config';
import { initDb } from './db/db';
import { seedDb } from './db/seed';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as productsRouter } from './features/products/product.router';
import { router as inventoryRouter } from './features/inventory/inventory.router';
import { router as recipesRouter } from './features/recipes/recipe.router';
import { router as donationsRouter } from './features/donations/donation.router';
import { router as usersRouter } from './features/users/user.router';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('FreshTrack API');
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/users', usersRouter);

// Error handling middleware
app.use(errorsMiddleware);

if (NODE_ENV !== 'production' && NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log('Server is running on http://localhost:' + PORT);

    try {
      await initDb();
      await seedDb();
    } catch (error) {
      console.error('Database init failed', error);
    }
  });
}

export default app;