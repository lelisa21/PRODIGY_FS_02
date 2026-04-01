import Message from '../models/Message.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { getIO } from '../socket.js';

class MessageController {
  getMessages = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'profile email role')
        .lean(),
      Message.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: messages.map((msg) => ({
        id: msg._id,
        text: msg.text,
        createdAt: msg.createdAt,
        createdBy: {
          id: msg.createdBy?._id,
          name: msg.createdBy?.profile
            ? `${msg.createdBy.profile.firstName} ${msg.createdBy.profile.lastName}`.trim()
            : msg.createdBy?.email,
          email: msg.createdBy?.email,
          role: msg.createdBy?.role,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  createMessage = catchAsync(async (req, res) => {
    const text = (req.body.text || '').trim();
    if (!text) {
      throw new AppError('Message text is required', 400);
    }

    const message = await Message.create({
      text,
      createdBy: req.user.id,
    });

    const populated = await Message.findById(message._id)
      .populate('createdBy', 'profile email role')
      .lean();

    const payload = {
      id: populated._id,
      text: populated.text,
      createdAt: populated.createdAt,
      createdBy: {
        id: populated.createdBy?._id,
        name: populated.createdBy?.profile
          ? `${populated.createdBy.profile.firstName} ${populated.createdBy.profile.lastName}`.trim()
          : populated.createdBy?.email,
        email: populated.createdBy?.email,
        role: populated.createdBy?.role,
      },
    };

    try {
      const io = getIO();
      io.to('team').emit('message:new', payload);
    } catch {
      // Socket not initialized or emit failed
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: payload,
    });
  });
}

export default new MessageController();
