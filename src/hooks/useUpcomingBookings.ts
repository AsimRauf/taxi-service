import { useState, useEffect, useCallback, useRef } from 'react';
import { Booking } from '@/types/booking';
import { useAuth } from '@/contexts/AuthContext';

export const useUpcomingBookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isFirstRender = useRef(true);

  const fetchBookings = useCallback(async () => {
    // Don't fetch if no token is available
    if (!token) {
      setError(new Error('Unauthorized'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      const response = await fetch('/api/bookings/user-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if data has the expected structure
      if (!Array.isArray(data?.bookings)) {
        throw new Error('Invalid response format');
      }

      setBookings(data.bookings);
    } catch (err) {
      console.error('Booking fetch error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch bookings'));
      setBookings([]); // Clear bookings on error
    } finally {
      setLoading(false);
    }
  }, [token]); // Only re-create when token changes

  // Initial fetch only on first render and when token is available
  useEffect(() => {
    if (isFirstRender.current && token) {
      isFirstRender.current = false;
      fetchBookings();
    }
  }, [token, fetchBookings]);

  const refresh = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 300); // Debounce refresh calls
    return () => clearTimeout(timeoutId);
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refresh
  };
};