import api from './api';

class AuthService {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  }

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  }

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token, password) {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  }

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data) {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  }

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }
}

export default new AuthService();
