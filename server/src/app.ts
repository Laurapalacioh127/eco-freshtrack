import express from 'express';
import cors from 'cors';
import { NODE_ENV, PORT } from './config';
import { errorsMiddleware } from './middlewares/errorsMiddleware';
import { router as productsRouter } from './features/products/product.router';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('FreshTrack API');
});

// Routes
app.use('/api/products', productsRouter);

// Error handling middleware
app.use(errorsMiddleware);

if (NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
  });
}

export default app;