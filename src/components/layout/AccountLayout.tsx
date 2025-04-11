import { FC, ReactNode, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User, BookOpen, Clock, Bell } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';

interface Notification {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
  metadata?: {
    bookingDetails?: {
      clientBookingId: string;
      pickupDateTime: string;
      vehicle: string;
      price: number;
    }
  }
}

interface AccountLayoutProps {
  children: ReactNode;
}

const AccountLayout: FC<AccountLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { 
      label: t('nav.viewAll'), 
      href: '/account/bookings', 
      icon: <BookOpen className="w-[18px] h-[18px]" />,
      active: router.pathname === '/account/bookings'
    },
    {
      label: t('nav.upcomingRides'),
      href: '/account/upcoming',
      icon: <Clock className="w-[18px] h-[18px]" />,
      active: router.pathname === '/account/upcoming'
    },
    { 
      label: t('nav.profile'), 
      href: '/account/profile', 
      icon: <User className="w-[18px] h-[18px]" />,
      active: router.pathname === '/account/profile'
    }
  ];

  // Memoize fetchNotifications with useCallback
  const fetchNotifications = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/notifications/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }, [token]); // Add token as dependency

  useEffect(() => {
    const fetchUserNotifications = async () => {
      if (!user?.id || !token) return; // Check for both user and token

      try {
        const data = await fetchNotifications(user.id);
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUserNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchUserNotifications, 30000);

    return () => clearInterval(interval);
  }, [user?.id, token, fetchNotifications]); // Add fetchNotifications to dependencies

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatNotificationDate = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: router.locale === 'nl' ? nl : enUS
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-[76px] xs:pt-[84px] sm:pt-[92px] bg-gray-50">
        <div className="container mx-auto px-2 xs:px-4 py-4 xs:py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-4 xs:gap-6 sm:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0 sticky top-[92px]">
              <div className="bg-white rounded-xl shadow-sm border border-secondary/20 overflow-hidden">
                <div className="p-4 sm:p-6 bg-secondary text-white flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold">{t('nav.myAccount')}</h2>
                  <button 
                    className="relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-medium mb-3">{t('notifications.title')}</h3>
                    {notifications.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification._id}
                            className={`p-3 rounded-lg text-sm ${
                              notification.read ? 'bg-gray-50' : 'bg-blue-50'
                            }`}
                            onClick={() => markAsRead(notification._id)}
                          >
                            <p className="font-medium">{notification.message}</p>
                            {notification.metadata?.bookingDetails && (
                              <div className="mt-1 text-gray-600">
                                <p>Booking #{notification.metadata.bookingDetails.clientBookingId}</p>
                                <p>{notification.metadata.bookingDetails.vehicle}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatNotificationDate(notification.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{t('notifications.empty')}</p>
                    )}
                  </div>
                )}

                <nav className="p-3">
                  <ul className="space-y-1.5">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            item.active 
                              ? 'bg-primary text-secondary font-medium' 
                              : 'text-gray-600 hover:bg-primary/10 hover:text-secondary'
                          }`}
                        >
                          <span className="mr-2.5">{item.icon}</span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 -mx-2 px-2">
              <button 
                className="relative flex items-center px-3 py-2 rounded-full bg-white"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="ml-1.5 bg-primary text-white text-xs px-1.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-full whitespace-nowrap text-sm ${
                    item.active 
                      ? 'bg-primary text-secondary font-medium' 
                      : 'bg-white text-gray-600 hover:bg-primary/10 hover:text-secondary'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Notifications Panel */}
            {showNotifications && (
              <div className="lg:hidden bg-white rounded-xl shadow-sm border border-secondary/20 p-4 mb-4">
                <h3 className="font-medium mb-3">{t('notifications.title')}</h3>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification._id}
                        className={`p-3 rounded-lg text-sm ${
                          notification.read ? 'bg-gray-50' : 'bg-blue-50'
                        }`}
                        onClick={() => markAsRead(notification._id)}
                      >
                        <p className="font-medium">{notification.message}</p>
                        {notification.metadata?.bookingDetails && (
                          <div className="mt-1 text-gray-600">
                            <p>Booking #{notification.metadata.bookingDetails.clientBookingId}</p>
                            <p>{notification.metadata.bookingDetails.vehicle}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatNotificationDate(notification.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{t('notifications.empty')}</p>
                )}
              </div>
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl shadow-sm border border-secondary/20 p-3 xs:p-4 sm:p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
