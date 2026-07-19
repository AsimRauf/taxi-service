import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import AccountLayout from '@/components/layout/AccountLayout';
import BookingCard from '@/components/bookings/BookingCard';
import { useUserBookings } from '@/hooks/useUserBookings';
import { Loader } from 'react-feather';
import { withAuth } from '@/components/auth/withAuth';

type StatusFilter = 'all' | 'active' | 'completed' | 'cancelled';

const BookingsPage: FC = () => {
  const { t } = useTranslation('common');
  const { bookings, loading, error, refetch } = useUserBookings();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const counts = useMemo(() => ({
    all: bookings.length,
    active: bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => ['cancelled', 'no-show'].includes(b.status)).length
  }), [bookings]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status));
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'cancelled':
        return bookings.filter(b => ['cancelled', 'no-show'].includes(b.status));
      default:
        return bookings;
    }
  }, [bookings, filter]);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: t('booking.filters.all') },
    { key: 'active', label: t('booking.filters.active') },
    { key: 'completed', label: t('booking.filters.completed') },
    { key: 'cancelled', label: t('booking.filters.cancelled') }
  ];

  if (error) {
    return (
      <AccountLayout>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{t('common.error.generic')}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-4 xs:mb-6 text-gray-900">
        {t('nav.viewAll')}
      </h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-4 xs:mb-6">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs xs:text-sm font-medium transition-colors ${filter === key
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-6 xs:py-8">
          <Loader className="w-6 h-6 xs:w-8 xs:h-8 animate-spin text-secondary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 xs:py-8 text-gray-600">
          <p className="text-sm xs:text-base">{t('nav.noBookings')}</p>
        </div>
      ) : (
        <div className="space-y-3 xs:space-y-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onRefresh={refetch}
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
