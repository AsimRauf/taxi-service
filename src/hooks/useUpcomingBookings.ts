import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/types/booking';
import { useAuth } from '@/contexts/AuthContext';

export const useUpcomingBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings/upcoming', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [token]); // Add token as dependency since it's used inside fetchBookings

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token, fetchBookings]); // Now fetchBookings is stable between renders

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings
  };
};