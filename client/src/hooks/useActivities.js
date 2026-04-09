import { useState, useEffect } from 'react';
import { getRecentActivities } from '../services/activity.service';

export const useActivities = (limit = 20) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await getRecentActivities(limit);
      setActivities(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { activities, loading, error, refetch: fetchActivities };
};
