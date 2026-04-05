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
  const [sending, setSending] = useState(false);

  const displayName =
    user?.fullName ||
    `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() ||
    user?.email ||
    'User';

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await messageService.getMessages();
      // Handle different response structures
      const messageData = response.data?.data || response.data || [];
      setMessages(Array.isArray(messageData) ? messageData : []);
    } catch (error) {
      console.error('Load messages error:', error);
      showError(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();
    
    // Handle new message event
    const handleNewMessage = (msg) => {
      console.log('New message received:', msg);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((item) => item._id === msg._id || item.id === msg.id)) {
          return prev;
        }
        return [msg, ...prev];
      });
    };
    
    websocketService.on('message:new', handleNewMessage);
    
    return () => {
      websocketService.off('message:new', handleNewMessage);
      // Don't disconnect immediately, keep connection for other features
      // websocketService.disconnect();
    };
  }, []);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    setSending(true);
    try {
      const response = await messageService.createMessage(trimmed);
      const newMessage = response.data?.data || response.data;
      
      // Add message to list immediately (optimistic update)
      if (newMessage) {
        setMessages((prev) => [newMessage, ...prev]);
      }
      
      setText('');
      showSuccess('Message sent successfully');
    } catch (error) {
      console.error('Send message error:', error);
      showError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = ['admin', 'manager'].includes(user?.role || 'employee');

  // Get sender name from message
  const getSenderName = (msg) => {
    if (msg.createdBy?.name) return msg.createdBy.name;
    if (msg.createdBy?.fullName) return msg.createdBy.fullName;
    if (msg.createdBy?.profile?.firstName) {
      return `${msg.createdBy.profile.firstName} ${msg.createdBy.profile.lastName || ''}`.trim();
    }
    return 'User';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Messages</h1>
          <p className="text-secondary-600 mt-1">Share announcements with your team</p>
        </div>
      </FadeIn>

      {canSend && (
        <SlideIn direction="up">
          <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Write an announcement..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                disabled={sending}
              />
              <Button 
                variant="primary" 
                icon={<FiSend />} 
                onClick={handleSend} 
                disabled={!text.trim() || sending}
                isLoading={sending}
              >
                Send
              </Button>
            </div>
          </div>
        </SlideIn>
      )}

      {!canSend && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700 text-sm">
            Only admins and managers can send messages. You can view all announcements below.
          </p>
        </div>
      )}

      <SlideIn direction="up" delay={0.1}>
        <div className="space-y-3">
          {loading && (
            <div className="space-y-3">
              <div className="skeleton h-24 rounded-lg" />
              <div className="skeleton h-24 rounded-lg" />
              <div className="skeleton h-24 rounded-lg" />
            </div>
          )}
          
          {!loading && messages.length === 0 && (
            <div className="text-center text-secondary-500 py-12 bg-white rounded-xl border border-secondary-200">
              <p>No messages yet</p>
              {canSend && (
                <p className="text-sm mt-2">Be the first to send an announcement!</p>
              )}
            </div>
          )}
          
          {!loading && messages.map((msg) => (
            <div 
              key={msg._id || msg.id} 
              className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <FiUser size={14} />
                  </div>
                  <span className="font-medium text-secondary-900">
                    {getSenderName(msg)}
                  </span>
                </div>
                <span className="text-xs text-secondary-400">
                  {msg.createdAt && formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-secondary-700 ml-10">{msg.text}</p>
            </div>
          ))}
        </div>
      </SlideIn>
    </div>
  );
};

export default Messages;
