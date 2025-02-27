import { useRouter } from 'next/router';
import { useEdit } from '@/contexts/EditContext';
import { useTranslation } from 'next-i18next';

export const NavigationButtons = ({
  onSave,
  isValid = true,
  isLoading = false
}: {
  onSave: () => Promise<void>,
  isValid?: boolean,
  isLoading?: boolean
}) => {
  const router = useRouter();
  const { isEditing } = useEdit();
  const { t } = useTranslation();

  const handleAction = async () => {
    if (isEditing) {
      await onSave();
      router.push('/booking/overview');
    } else {
      onSave();
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <button
        onClick={() => router.back()}
        className="px-6 py-3 text-gray-600 hover:text-gray-900"
      >
        {t('booking.back')}
      </button>
      <button
        onClick={handleAction}
        disabled={!isValid || isLoading}
        className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90"
      >
        {isEditing ? t('booking.update') : t('booking.continue')}
      </button>
    </div>
  );
};