import express from 'express';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from "./routes/emloyee.routes.js"


const app = express();

// middleware
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use("/api/employees", employeeRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message || "Server Error"
  })
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
