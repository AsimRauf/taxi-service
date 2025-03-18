import { FC } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import AccountLayout from '@/components/layout/AccountLayout';
import BookingCard from '@/components/bookings/BookingCard';
import { useUserBookings } from '@/hooks/useUserBookings';
import { Loader } from 'react-feather';
import { withAuth } from '@/components/auth/withAuth';

const BookingsPage: FC = () => {
  const { t } = useTranslation('common');
  const { bookings, loading, error } = useUserBookings();

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
        {t('nav.viewAll')}
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-6 xs:py-8">
          <Loader className="w-6 h-6 xs:w-8 xs:h-8 animate-spin text-secondary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-6 xs:py-8 text-gray-600">
          <p className="text-sm xs:text-base">{t('nav.noBookings')}</p>
        </div>
      ) : (
        <div className="space-y-3 xs:space-y-4">
          {bookings.map((booking) => (
            <BookingCard 
              key={booking._id} 
              booking={booking}
            />
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

export default withAuth(BookingsPage);