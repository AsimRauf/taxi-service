import { useState, useEffect, useCallback, useRef } from 'react';
import { Booking } from '@/types/booking';
import { useAuth } from '@/contexts/AuthContext';

export const useUpcomingBookings = () => {
  const { token, isLoading: authLoading, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isFirstRender = useRef(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBookings = useCallback(async () => {
    // Wait for auth to finish — withAuth redirects unauthenticated users,
    // so a missing token here is a loading state, not an error
    if (authLoading || !token || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bookings/upcoming', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setBookings([]);
          throw new Error('Please refresh the page and try again');
        }
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data?.bookings)) {
        throw new Error('Invalid response format');
      }

      setBookings(data.bookings);
    } catch (err) {
      console.error('Booking fetch error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch bookings'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading, user]);

  // Initial fetch once auth is ready
  useEffect(() => {
    if (!authLoading && token && user && isFirstRender.current) {
      isFirstRender.current = false;
      fetchBookings();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [token, authLoading, user, fetchBookings]);

  // Debounced refresh
  const refresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(fetchBookings, 300);
  }, [fetchBookings]);

  return {
    bookings,
    loading: loading || authLoading,
    error,
    refresh
  };
};
