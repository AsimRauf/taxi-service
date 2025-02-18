import { useTranslation } from 'next-i18next';
import { Luggage, Car, Route, User } from 'lucide-react';
import { useRouter } from 'next/router';

interface StepperProps {
    currentStep: string;
}

const steps = [
    { id: 'luggage', icon: Luggage },
    { id: 'offers', icon: Car },
    { id: 'travel-info', icon: Route },
    { id: 'personal-info', icon: User }
];

export const Stepper = ({ currentStep }: StepperProps) => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleStepClick = (stepId: string) => {
        const savedData = localStorage.getItem('bookingData');
        if (savedData) {
            router.push(`/booking/${stepId}`);
        }
    };

    return (
        <div className="fixed top-20 lg:mt-10 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-md z-10">
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="relative">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100" />
                    <ol className="relative flex justify-between items-center w-full">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <li 
                                    key={step.id}
                                    className="flex flex-col items-center cursor-pointer"
                                    onClick={() => handleStepClick(step.id)}
                                >
                                    <div className={`
                                        z-10 flex items-center justify-center w-10 h-10 rounded-full 
                                        transition-colors duration-200
                                        ${currentStep === step.id 
                                            ? 'bg-primary text-white' 
                                            : 'bg-gray-100 text-gray-500'}
                                    `}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`
                                        mt-2 text-xs font-medium hidden sm:block
                                        ${currentStep === step.id 
                                            ? 'text-primary' 
                                            : 'text-gray-500'}
                                    `}>
                                        {t(`booking.steps.${step.id}`)}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </div>
    );
};
