import express from 'express';
import authRoutes from './routes/auth.routes.js';
const app = express();

// middleware
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
