import { FC } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import AccountLayout from '@/components/layout/AccountLayout';
import BookingCard from '@/components/bookings/BookingCard';
import { useUpcomingBookings } from '@/hooks/useUpcomingBookings';
import { Loader } from 'react-feather';
import { withAuth } from '@/components/auth/withAuth';
import { Booking } from '@/types/booking';
import { useEffect, useState } from 'react';

const UpcomingRidesPage: FC = () => {
  const { t } = useTranslation('common');
  const { bookings, loading, error, refresh } = useUpcomingBookings();
  const [sortedBookings, setSortedBookings] = useState<Booking[]>([]);
  const [now, setNow] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Sort bookings by closest pickup time
  useEffect(() => {
    if (bookings) {
      const sorted = [...bookings].sort((a, b) => {
        const timeA = new Date(a.pickupDateTime).getTime();
        const timeB = new Date(b.pickupDateTime).getTime();
        return timeA - timeB;
      });
      setSortedBookings(sorted);
    }
  }, [bookings]);

  const getTimeRemaining = (pickupTime: string) => {
    const pickup = new Date(pickupTime);
    const diff = pickup.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return t('booking.timeRemaining.days', { days, hours });
    } else if (hours > 0) {
      return t('booking.timeRemaining.hours', { hours, minutes });
    } else if (minutes > 0) {
      return t('booking.timeRemaining.minutes', { minutes });
    } else {
      return t('booking.timeRemaining.soon');
    }
  };

  if (error) {
    return (
      <AccountLayout>
        <div className="text-center text-red-600">
          <p>{t('common.error.generic')}</p>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-4 xs:mb-6 text-gray-900">
        {t('nav.upcomingRides')}
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-6 xs:py-8">
          <Loader className="w-6 h-6 xs:w-8 xs:h-8 animate-spin text-secondary" />
        </div>
      ) : sortedBookings.length === 0 ? (
        <div className="text-center py-6 xs:py-8 text-gray-600">
          <p className="text-sm xs:text-base">{t('nav.noUpcomingRides')}</p>
        </div>
      ) : (
        <div className="space-y-3 xs:space-y-4">
          {sortedBookings.map((booking) => (
            <div key={booking._id} className="space-y-2">
              <div className="bg-primary/5 px-3 py-2 rounded-lg">
                <p className="text-sm text-secondary font-medium">
                  {getTimeRemaining(booking.pickupDateTime)}
                </p>
              </div>
              <BookingCard 
                booking={booking}
                onRefresh={refresh}
              />
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default withAuth(UpcomingRidesPage);