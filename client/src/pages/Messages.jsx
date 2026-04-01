import { useEffect, useState } from 'react';
import { FiSend, FiUser } from 'react-icons/fi';
import { FadeIn, SlideIn } from '../components/animations';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';

const STORAGE_KEY = 'ems_messages';

const Messages = () => {
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const displayName =
    user?.fullName ||
    `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() ||
    user?.email ||
    'User';

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch {
        setMessages([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMessage = {
      id: Date.now(),
      text: trimmed,
      user: displayName,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [newMessage, ...prev]);
    setText('');
  };

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
              placeholder="Write an announcement..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
            />
            <Button variant="primary" icon={<FiSend />} onClick={handleSend}>
              Send
            </Button>
          </div>
        </div>
      </SlideIn>

      <SlideIn direction="up" delay={0.1}>
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-secondary-500 py-8">
              No messages yet
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4">
              <div className="flex items-center gap-2 text-secondary-600 text-sm mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  <FiUser size={12} />
                </div>
                <span className="font-medium">{msg.user}</span>
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
