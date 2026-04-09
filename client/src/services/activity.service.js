import api from './api';

export const getRecentActivities = async (limit = 20) => {
  try {
    const response = await api.get(`/activities/recent?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};
