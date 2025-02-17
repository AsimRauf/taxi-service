import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const steps = [
    { id: 'luggage', label: 'Luggage' },
    { id: 'offers', label: 'Offers' },
    { id: 'travel-info', label: 'Travel Info' },
    { id: 'personal-info', label: 'Personal Info' }
];

export const Stepper = ({ currentStep }: { currentStep: string }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleStepClick = (stepId: string) => {
        const savedData = localStorage.getItem('bookingData');
        if (savedData) {
            router.push(`/booking/${stepId}`);
        }
    };

    return (
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-sm mb-6">
            <div className="max-w-2xl mx-auto py-4 px-6">
                <ol className="flex items-center justify-between w-full relative">
                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100" />
                    {steps.map((step, idx) => (
                        <li key={step.id} 
                            className="flex flex-col items-center relative"
                            onClick={() => handleStepClick(step.id)}
                        >
                            <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 cursor-pointer
                                ${currentStep === step.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                            >
                                <span className="text-sm font-medium">{idx + 1}</span>
                            </div>
                            <span className={`mt-2 text-xs whitespace-nowrap
                                ${currentStep === step.id ? 'text-primary font-medium' : 'text-gray-500'}`}
                            >
                                {t(`booking.steps.${step.id}`)}
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};
