import api from './api';

class MessageService {
  async getMessages(page = 1, limit = 50) {
    const response = await api.get('/messages', { params: { page, limit } });
    return response.data;
  }

  async createMessage(text) {
    const response = await api.post('/messages', { text });
    return response.data;
  }
}

export default new MessageService();
