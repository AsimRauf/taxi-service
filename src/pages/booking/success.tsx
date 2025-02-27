import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const BookingSuccessPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-8 sm:pt-16 pb-8 sm:pb-16">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('booking.success.title')}</h1>
          <p className="text-gray-600 mb-6">{t('booking.success.message')}</p>
          <button
            onClick={() => router.push('/booking/overview')}
            className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
          >
            {t('booking.success.viewBookings')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
};

export default BookingSuccessPage;