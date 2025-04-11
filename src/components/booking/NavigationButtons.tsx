import { useTranslation } from 'next-i18next';

interface NavigationButtonsProps {
  onBack: () => void;
  onContinue: () => void;
  loading?: boolean;
  disabled?: boolean; // Add disabled prop
  continueText?: string;
  backText?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onContinue,
  loading = false,
  disabled = false, // Add default value
  continueText,
  backText,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="flex justify-between gap-4">
      <button
        onClick={onBack}
        className="flex-1 py-3 px-4 rounded-lg text-primary hover:bg-primary/5 transition-colors"
      >
        {backText || t('common.back')}
      </button>
      <button
        onClick={onContinue}
        disabled={loading || disabled} // Add disabled to button
        className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span>{t('common.processing')}</span>
        ) : (
          <span>{continueText || t('common.continue')}</span>
        )}
      </button>
    </div>
  );
};