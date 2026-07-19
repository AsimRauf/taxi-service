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
  const { bookingId } = router.query;
  const [details, setDetails] = useState<{
    clientBookingId: string;
    price?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState(false);

  useEffect(() => {
    if (!bookingId || typeof bookingId !== 'string') return;

    // Re-verify with the payment provider — customers sometimes land on the
    // cancel URL even though the payment actually went through
    fetch(`/api/payments/check-status?bookingId=${bookingId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to check status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.paymentStatus === 'completed') {
          router.replace(`/payment-success?bookingId=${bookingId}`);
          return;
        }
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error checking payment status:', err);
        setLoading(false);
      });
  }, [bookingId, router]);

  const handleRetryPayment = async () => {
    if (!bookingId || typeof bookingId !== 'string') return;
    setIsRetrying(true);
    setRetryError(false);
    try {
      const response = await fetch('/api/payments/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, locale: router.locale })
      });
      const data = await response.json();
      if (response.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      throw new Error(data.error || 'Retry failed');
    } catch (error) {
      console.error('Payment retry error:', error);
      setRetryError(true);
      setIsRetrying(false);
    }
  };

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
          ) : details ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-medium">{t('payment.bookingReference')}: #{details.clientBookingId}</p>
              {typeof details.price === 'number' && (
                <p className="text-gray-600 mt-2">{t('payment.amount')}: €{details.price.toFixed(2)}</p>
              )}
              <p className="text-gray-600 mt-2">{t('payment.status')}:
                <span className="text-red-600 font-medium"> {t('payment.statusFailed')}</span>
              </p>
            </div>
          ) : null}

          {retryError && (
            <p className="text-red-500 text-sm text-center mb-4">{t('payment.retryError')}</p>
          )}

          <div className="space-y-4">
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying || loading}
              className="block w-full py-3 px-4 bg-primary text-white text-center rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isRetrying ? t('payment.redirecting') : t('payment.retryPayment')}
            </button>
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
