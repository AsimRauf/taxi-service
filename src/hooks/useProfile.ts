import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
}

interface ProfileData {
  name: string;
  email: string;
  phoneNumber: string;
  currentPassword?: string;
  newPassword?: string;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, login } = useAuth();

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    return /^\+31[0-9]{9}$/.test(phoneNumber);
  };

  const updateProfile = async (data: ProfileData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate phone number format
      if (!validatePhoneNumber(data.phoneNumber)) {
        throw new Error('Please enter a valid Netherlands phone number (+31XXXXXXXXX)');
      }

      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result: ProfileResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      // Use the login function from AuthContext to update both token and user
      // This ensures consistency with how user data is handled in the app
      login(token!, result.user);
      
      toast.success(result.message || 'Profile updated successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (currentPassword?: string, newPassword?: string): boolean => {
    if (newPassword && !currentPassword) {
      throw new Error('Current password is required to set new password');
    }
    if (newPassword && newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }
    return true;
  };

  return {
    updateProfile,
    loading,
    error,
    validatePassword
  };
};