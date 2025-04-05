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
  const { token, isLoading: authLoading, user } = useAuth();
  const isFirstRender = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBookings = useCallback(async () => {
    // Don't fetch if auth is still loading or no token/user
    if (authLoading || !token || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bookings/user-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies
        cache: 'no-store' // Prevent caching
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear local state on auth failure
          setBookings([]);
          throw new Error('Please refresh the page and try again');
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.bookings)) {
        throw new Error('Invalid response format');
      }

      setBookings(data.bookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading, user]);

  // Initial fetch only when auth is ready and we have a token
  useEffect(() => {
    if (!authLoading && token && user && isFirstRender.current) {
      isFirstRender.current = false;
      fetchBookings();
    }
    
    // Cleanup on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [token, authLoading, user, fetchBookings]);

  // Debounced refetch function
  const refetch = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(fetchBookings, 300);
  }, [fetchBookings]);

  return {
    bookings,
    loading: loading || authLoading,
    error,
    refetch
  };
}
