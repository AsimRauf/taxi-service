import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

const PaymentFailedPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { bookingId, transactionid } = router.query;
  const [bookingDetails, setBookingDetails] = useState<{
    clientBookingId: string;
    price: number;
    payment?: {
      status: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      console.log("Fetching booking details for:", bookingId);
      console.log("Transaction ID:", transactionid);
      
      // Fetch booking details
      fetch(`/api/bookings/${bookingId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch booking: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("Booking details received:", data);
          setBookingDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching booking:', err);
          setLoading(false);
        });
    }
  }, [bookingId, transactionid]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-16 pb-16">
      <div className="max-w-md mx-auto px-4 mt-16">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('payment.failed.title')}</h1>
            <p className="text-gray-600 mt-2">{t('payment.failed.message')}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bookingDetails ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-medium">{t('payment.bookingReference')}: #{bookingDetails.clientBookingId}</p>
              <p className="text-gray-600 mt-2">{t('payment.amount')}: €{bookingDetails.price.toFixed(2)}</p>
              <p className="text-gray-600 mt-2">{t('payment.status')}: 
                <span className="text-red-600 font-medium"> {t('payment.statusFailed')}</span>
              </p>
            </div>
          ) : null}

          <div className="space-y-4">
            <Link href={`/booking/retry-payment?bookingId=${bookingId}`} className="block w-full py-3 px-4 bg-primary text-white text-center rounded-lg hover:bg-primary/90 transition-colors">
              {t('payment.retryPayment')}
            </Link>
            <Link href="/booking/overview" className="block w-full py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors">
              {t('payment.backToBookings')}
            </Link>
            <Link href="/" className="block w-full py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors">
              {t('payment.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default PaymentFailedPage;