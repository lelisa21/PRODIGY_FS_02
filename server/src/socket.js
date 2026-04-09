import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;
const isLocalhost =
  typeof frontendUrl === "string" && /localhost|127\.0\.0\.1/i.test(frontendUrl);
const allowAllOrigins = !frontendUrl || (isProduction && isLocalhost);

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowAllOrigins ? true : frontendUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join('team');
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
