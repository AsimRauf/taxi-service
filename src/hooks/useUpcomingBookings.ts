import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/types/booking';

export const useUpcomingBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings/user-bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Something went wrong'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since fetch URL doesn't change

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const refresh = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refresh
  };
};