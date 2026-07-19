import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

type VerificationState = 'verifying' | 'completed' | 'pending' | 'failed';

const POLL_INTERVAL_MS = 3500;
const MAX_POLLS = 10; // ~35s of polling before we stop and show "still processing"

interface StatusResponse {
  clientBookingId: string;
  paymentStatus: string;
  price?: number;
}

// Once a booking is paid, every locally stored draft of it is stale — remove
// it so the booking flow starts clean and the overview no longer lists it.
const cleanupLocalStorage = (clientBookingId: string) => {
  try {
    const savedBookings = localStorage.getItem('allBookings');
    if (savedBookings) {
      const bookings = JSON.parse(savedBookings);
      const remaining = bookings.filter(
        (b: { clientBookingId?: string; id?: string }) =>
          b.clientBookingId !== clientBookingId && b.id !== clientBookingId
      );
      localStorage.setItem('allBookings', JSON.stringify(remaining));
    }

    const draft = localStorage.getItem('bookingData');
    if (draft) {
      const parsed = JSON.parse(draft);
      if (parsed?.clientBookingId === clientBookingId || parsed?.id === clientBookingId) {
        localStorage.removeItem('bookingData');
      }
    }

    if (localStorage.getItem('editingBookingId') === clientBookingId) {
      localStorage.removeItem('editingBookingId');
      localStorage.removeItem('previousSection');
    }
  } catch (error) {
    console.error('Error cleaning up local storage:', error);
  }
};

const PaymentSuccessPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { bookingId } = router.query;
  const [state, setState] = useState<VerificationState>('verifying');
  const [details, setDetails] = useState<StatusResponse | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState(false);
  const pollCount = useRef(0);

  const checkStatus = useCallback(async (id: string): Promise<StatusResponse | null> => {
    try {
      const response = await fetch(`/api/payments/check-status?bookingId=${id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    if (!bookingId || typeof bookingId !== 'string') return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const data = await checkStatus(bookingId);
      if (cancelled) return;

      if (data) {
        setDetails(data);

        if (data.paymentStatus === 'completed') {
          cleanupLocalStorage(data.clientBookingId);
          setState('completed');
          return;
        }
        if (data.paymentStatus === 'failed' || data.paymentStatus === 'expired') {
          setState('failed');
          return;
        }
      }

      pollCount.current += 1;
      if (pollCount.current >= MAX_POLLS) {
        // Payment provider hasn't confirmed yet — tell the customer honestly
        setState('pending');
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bookingId, checkStatus]);

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

  const icon = {
    verifying: <Clock className="w-8 h-8 text-primary animate-pulse" />,
    completed: <CheckCircle className="w-8 h-8 text-green-600" />,
    pending: <Clock className="w-8 h-8 text-amber-500" />,
    failed: <XCircle className="w-8 h-8 text-red-600" />
  }[state];

  const iconBg = {
    verifying: 'bg-primary/10',
    completed: 'bg-green-100',
    pending: 'bg-amber-100',
    failed: 'bg-red-100'
  }[state];

  const title = {
    verifying: t('payment.verifying.title'),
    completed: t('payment.success.title'),
    pending: t('payment.processing.title'),
    failed: t('payment.failed.title')
  }[state];

  const message = {
    verifying: t('payment.verifying.message'),
    completed: t('payment.success.message'),
    pending: t('payment.processing.message'),
    failed: t('payment.failed.message')
  }[state];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-16 pb-16">
      <div className="max-w-md mx-auto px-4 mt-16">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${iconBg} rounded-full mb-4`}>
              {icon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>

          {state === 'verifying' ? (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : details ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-medium">{t('payment.bookingReference')}: {details.clientBookingId}</p>
              {typeof details.price === 'number' && (
                <p className="text-gray-600 mt-2">{t('payment.amount')}: €{details.price.toFixed(2)}</p>
              )}
              <p className="text-gray-600 mt-2">{t('payment.status')}:{' '}
                {state === 'completed' && <span className="text-green-600 font-medium">{t('payment.statusCompleted')}</span>}
                {state === 'pending' && <span className="text-amber-600 font-medium">{t('payment.statusPending')}</span>}
                {state === 'failed' && <span className="text-red-600 font-medium">{t('payment.statusFailed')}</span>}
              </p>
            </div>
          ) : null}

          {retryError && (
            <p className="text-red-500 text-sm text-center mb-4">{t('payment.retryError')}</p>
          )}

          <div className="space-y-4">
            {state === 'failed' && (
              <button
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="block w-full py-3 px-4 bg-primary text-white text-center rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isRetrying ? t('payment.redirecting') : t('payment.retryPayment')}
              </button>
            )}
            {state === 'completed' && (
              <Link href="/account/upcoming" className="block w-full py-3 px-4 bg-primary text-white text-center rounded-lg hover:bg-primary/90 transition-colors">
                {t('payment.viewBookings')}
              </Link>
            )}
            {state === 'pending' && (
              <p className="text-xs text-gray-500 text-center">{t('payment.processing.note')}</p>
            )}
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

export default PaymentSuccessPage;
