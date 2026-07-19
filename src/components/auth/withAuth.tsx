import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'react-feather';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.replace({
          pathname: '/auth/signin',
          query: { returnUrl: router.asPath }
        });
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader className="w-8 h-8 animate-spin text-secondary" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Route guard for the admin panel: requires a signed-in user with the admin
// role. Non-admins are sent to the homepage, guests to the sign-in page.
export function withAdminAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAdminAuthComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;
      if (!user) {
        router.replace({
          pathname: '/auth/signin',
          query: { returnUrl: router.asPath }
        });
      } else if (user.role !== 'admin') {
        router.replace('/');
      }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader className="w-8 h-8 animate-spin text-secondary" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}