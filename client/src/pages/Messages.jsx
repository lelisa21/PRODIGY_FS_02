import { useEffect, useState, useCallback } from 'react';
import { FiSend, FiUser } from 'react-icons/fi';
import { FadeIn, SlideIn } from '../components/animations';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import messageService from '../services/message.service';
import websocketService from '../services/websocket.service';
import { useToast } from '../context/ToastContext';

const Messages = () => {
  const user = useAuthStore((state) => state.user);
  const { error: showError, success: showSuccess } = useToast();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const displayName =
    user?.fullName ||
    `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() ||
    user?.email ||
    'User';

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await messageService.getMessages();
      setMessages(response.data || []);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    websocketService.connect();
    const handler = (msg) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === msg.id)) return prev;
        return [msg, ...prev];
      });
    };
    websocketService.on('message:new', handler);
    return () => {
      websocketService.off('message:new', handler);
      websocketService.disconnect();
    };
  }, []);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      await messageService.createMessage(trimmed);
      setText('');
      showSuccess('Message sent');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send message');
    }
  };

  const canSend = ['admin', 'manager'].includes(user?.role || 'employee');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Messages</h1>
          <p className="text-secondary-600 mt-1">Share announcements with your team</p>
        </div>
      </FadeIn>

      <SlideIn direction="up">
        <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder={canSend ? 'Write an announcement...' : 'Only admins and managers can send messages'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              disabled={!canSend}
            />
            <Button variant="primary" icon={<FiSend />} onClick={handleSend} disabled={!canSend}>
              Send
            </Button>
          </div>
        </div>
      </SlideIn>

      <SlideIn direction="up" delay={0.1}>
        <div className="space-y-3">
          {loading && (
            <div className="skeleton h-48 rounded-lg" />
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center text-secondary-500 py-8">
              No messages yet
            </div>
          )}
          {!loading && messages.map((msg) => (
            <div key={msg.id} className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4">
              <div className="flex items-center gap-2 text-secondary-600 text-sm mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  <FiUser size={12} />
                </div>
                <span className="font-medium">{msg.createdBy?.name || 'User'}</span>
                <span className="text-xs text-secondary-400">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-secondary-800">{msg.text}</p>
            </div>
          ))}
        </div>
      </SlideIn>
    </div>
  );
};

export default Messages;
