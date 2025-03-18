import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types/booking';

interface UseUserBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUserBookings(): UseUserBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();
  const isFirstRender = useRef(true);

  const fetchBookings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/bookings/user-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching user bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Debounced refetch function
  const refetch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchBookings]);

  // Initial fetch only
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchBookings();
    }
  }, [fetchBookings]);

  return { bookings, loading, error, refetch };
}
