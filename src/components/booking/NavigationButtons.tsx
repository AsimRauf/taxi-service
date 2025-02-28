import { useTranslation } from 'next-i18next';
import { ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  onBack: () => void;
  onContinue: () => void;
  continueText?: string;
  backText?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const NavigationButtons = ({
  onBack,
  onContinue,
  continueText,
  backText,
  disabled = false,
  loading = false
}: NavigationButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
      <button
        onClick={onBack}
        className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors text-center"
      >
        {backText || t('booking.back')}
      </button>
      <button
        onClick={onContinue}
        disabled={disabled || loading}
        className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? t('common.loading') : continueText || t('booking.continue')}
        {!loading && <ArrowRight size={18} />}
      </button>
    </div>
  );
};