import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types/booking';

interface UseUserBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUserBookings(): UseUserBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();

  const fetchBookings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
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
  };

  useEffect(() => {
    fetchBookings();
  }, [token, setBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
}
