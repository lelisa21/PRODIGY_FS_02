import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import requestLogger from './middlewares/requestLogger.js';
import { notFoundHandler } from './middlewares/notFound.js';


const app = express();

const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;
const isLocalhost =
  typeof frontendUrl === "string" && /localhost|127\.0\.0\.1/i.test(frontendUrl);
const allowAllOrigins = !frontendUrl || (isProduction && isLocalhost);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(
  cors({
    origin: allowAllOrigins ? true : frontendUrl,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.set("trust proxy", 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.log(`Rate limit hit by IP: ${req.ip}`); 
    res.status(options.statusCode).send(options.message);
  },
});
app.use('/api', limiter);
app.use(requestLogger);

app.use('/uploads', express.static('uploads'));

app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    }
  });
});

// 404 handler
app.use(notFoundHandler);

app.use(errorHandler);

export default app;
