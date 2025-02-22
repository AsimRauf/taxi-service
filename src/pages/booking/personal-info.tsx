import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { User, Phone, Mail, UserCheck, Lock, Eye, EyeOff, MapPin } from 'lucide-react'; // Import MapPin
import { Stepper } from '@/components/booking/Stepper';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { BookingData, Location } from '@/types/booking';
import { LocationInput } from '@/components/forms/booking/LocationInput';
import { WebsiteTranslations } from '@/types/translations';

interface BookingFormProps {
  translations: WebsiteTranslations;
}

interface PersonalInfoData {
  bookingType: 'individual' | 'business';
  fullName: string;
  email: string;
  phoneNumber: string;
  additionalPhone?: string;
  bookingForOther: boolean;
  otherFullName?: string;
  otherPhoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  companyName?: string;
  businessAddress?: Location;
}

const PersonalInfoPage = ({ translations }: BookingFormProps) => {
  const { t } = useTranslation('common');
  const i18n = useTranslation('common').i18n;
  const router = useRouter();
  const { user, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    bookingType: 'individual',
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber?.replace('+31', '') || '',
    additionalPhone: '',
    bookingForOther: false,
    otherFullName: '',
    otherPhoneNumber: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    businessAddress: undefined,
  });

  useEffect(() => {
    const savedData = localStorage.getItem('bookingData');
    const parsedData: BookingData | null = savedData ? JSON.parse(savedData) : null;

    if (!parsedData?.pickupDateTime || !parsedData?.destination) {
      router.push('/booking/travel-info');
      return;
    }

    setBookingData(parsedData);

    const initialPersonalInfo = {
      bookingType: parsedData.bookingType || 'individual',
      fullName: '',
      email: '',
      phoneNumber: '',
      additionalPhone: '',
      bookingForOther: false,
      otherFullName: '',
      otherPhoneNumber: '',
      password: '',
      confirmPassword: '',
      companyName: parsedData.businessInfo?.companyName || '',
      businessAddress: parsedData.businessInfo?.businessAddress || undefined,
    };

    if (user) {
      const formattedPhone = user.phoneNumber ? user.phoneNumber.replace('+31', '') : '';
      setPersonalInfo({
        ...initialPersonalInfo,
        fullName: user.name,
        email: user.email,
        phoneNumber: formattedPhone,
        bookingForOther: parsedData.bookingForOther ? true : false,
        otherFullName: parsedData.bookingForOther?.fullName || '',
        otherPhoneNumber: parsedData.bookingForOther?.phoneNumber?.replace('+31', '') || '',
        additionalPhone: parsedData.contactInfo?.additionalPhoneNumber?.replace('+31', '') || ''
      });
    } else if (parsedData.contactInfo) {
      setPersonalInfo({
        ...initialPersonalInfo,
        fullName: parsedData.contactInfo?.fullName || '',
        email: parsedData.contactInfo?.email || '',
        phoneNumber: parsedData.contactInfo?.phoneNumber?.replace('+31', '') || '',
        additionalPhone: parsedData.contactInfo?.additionalPhoneNumber?.replace('+31', '') || '',
        bookingForOther: !!parsedData.bookingForOther,
        otherFullName: parsedData.bookingForOther?.fullName || '',
        otherPhoneNumber: parsedData.bookingForOther?.phoneNumber?.replace('+31', '') || ''
      });
    }
  }, [router, user]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePhoneNumber = (phone: string) => {
    const fullNumber = phone.startsWith('+31') ? phone : `+31${phone}`;
    return fullNumber.length === 12 && /^\+31\d{9}$/.test(fullNumber);
  };

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};
    const savedData = localStorage.getItem('bookingData');
    const currentBookingData: BookingData | null = savedData ? JSON.parse(savedData) : null;

    if (!currentBookingData) {
      router.push('/booking/travel-info');
      return;
    }

    // Validation checks
    if (!personalInfo.fullName) {
      newErrors.fullName = t('booking.personalInfo.errors.fullNameRequired');
    }
    if (!personalInfo.email) {
      newErrors.email = t('booking.personalInfo.errors.emailRequired');
    } else if (!/^\S+@\S+\.\S+$/.test(personalInfo.email)) {
      newErrors.email = t('booking.personalInfo.errors.invalidEmail');
    }
    if (!personalInfo.phoneNumber) {
      newErrors.phoneNumber = t('booking.personalInfo.errors.phoneRequired');
    } else if (!validatePhoneNumber(personalInfo.phoneNumber)) {
      newErrors.phoneNumber = t('booking.personalInfo.errors.invalidPhone', {
        format: '+31XXXXXXXXX',
        example: '+31123456789'
      });
    }

    if (personalInfo.additionalPhone) {
      const additionalPhoneFormatted = personalInfo.additionalPhone.replace('+31', '');
      if (!validatePhoneNumber(additionalPhoneFormatted)) {
        newErrors.additionalPhone = t('booking.personalInfo.errors.invalidPhone', {
          format: '+31XXXXXXXXX',
          example: '+31123456789'
        });
      }
    }

    if (personalInfo.bookingForOther) {
      if (!personalInfo.otherFullName) {
        newErrors.otherFullName = t('booking.personalInfo.errors.otherFullNameRequired');
      }
      if (!personalInfo.otherPhoneNumber) {
        newErrors.otherPhoneNumber = t('booking.personalInfo.errors.otherPhoneRequired');
      } else if (!validatePhoneNumber(personalInfo.otherPhoneNumber)) {
        newErrors.otherPhoneNumber = t('booking.personalInfo.errors.invalidPhone', {
          format: '+31XXXXXXXXX',
          example: '+31123456789'
        });
      }
    }

    if (!user) {
      if (!personalInfo.password) {
        newErrors.password = t('auth.passwordRequired');
      } else if (personalInfo.password.length < 8) {
        newErrors.password = t('auth.passwordLength');
      }
      if (personalInfo.password !== personalInfo.confirmPassword) {
        newErrors.confirmPassword = t('auth.passwordMatch');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (!user && personalInfo.password) {
        await register({
          name: personalInfo.fullName,
          email: personalInfo.email,
          phoneNumber: `+31${personalInfo.phoneNumber}`,
          password: personalInfo.password
        });
      }

      if (bookingData) {
        const updatedBookingData: BookingData = {
          ...currentBookingData,
          bookingType: personalInfo.bookingType,
          businessInfo: personalInfo.bookingType === 'business' && personalInfo.businessAddress ? {
            companyName: personalInfo.companyName || '',
            businessAddress: personalInfo.businessAddress // Ensure businessAddress is included
          } : undefined,
          contactInfo: {
            fullName: personalInfo.fullName,
            email: personalInfo.email,
            phoneNumber: personalInfo.phoneNumber.startsWith('+31') ?
              personalInfo.phoneNumber :
              `+31${personalInfo.phoneNumber}`,
            additionalPhoneNumber: personalInfo.additionalPhone ?
              (personalInfo.additionalPhone.startsWith('+31') ?
                personalInfo.additionalPhone :
                `+31${personalInfo.additionalPhone}`) :
              undefined,
            hasAdditionalPhone: !!personalInfo.additionalPhone
          },
          bookingForOther: personalInfo.bookingForOther ? {
            fullName: personalInfo.otherFullName || '',
            phoneNumber: personalInfo.otherPhoneNumber ?
              (personalInfo.otherPhoneNumber.startsWith('+31') ?
                personalInfo.otherPhoneNumber :
                `+31${personalInfo.otherPhoneNumber}`) :
              ''
          } : undefined
        };

        console.log('Updated Booking Data:', updatedBookingData);
        console.dir(updatedBookingData, { depth: null, colors: true });

        localStorage.setItem('bookingData', JSON.stringify(updatedBookingData));

        // Verify saved data
        const verifyData = localStorage.getItem('bookingData');
        console.log('Verified Saved Data:', JSON.parse(verifyData!));
        router.push('/booking/payment');
      }
    } catch (error) {
      console.error('Error during registration or booking update:', error); // Log the error
      setErrors({ form: t('auth.registrationError') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center mt-8">
        <Stepper currentStep="personal-info" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-xl mt-8 lg:mt-[100px]"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
            {t('booking.personalInfo.title')}
          </h2>

          {/* Booking Type Selection */}
          <div className="flex gap-4 mb-8">
            <button
              className={`flex-1 py-2 rounded-lg text-center ${personalInfo.bookingType === 'individual' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setPersonalInfo({ ...personalInfo, bookingType: 'individual' })}
            >
              {t('booking.personalInfo.individual')}
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-center ${personalInfo.bookingType === 'business' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setPersonalInfo({ ...personalInfo, bookingType: 'business' })}
            >
              {t('booking.personalInfo.business')}
            </button>
          </div>

          <div className="space-y-6">
            {/* Name and Phone in single row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('booking.personalInfo.fullName')}
                  </h3>
                </div>
                <input
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  placeholder={t('booking.personalInfo.fullNamePlaceholder')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('booking.personalInfo.phoneNumber')}
                  </h3>
                </div>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    +31
                  </span>
                  <input
                    type="tel"
                    value={personalInfo.phoneNumber || ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setPersonalInfo({ ...personalInfo, phoneNumber: digits });
                    }}
                    placeholder="XXXXXXXXX"
                    className="block w-full border rounded-r-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Email and Additional Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('booking.personalInfo.email')}
                  </h3>
                </div>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder={t('booking.personalInfo.emailPlaceholder')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!personalInfo.additionalPhone}
                    onChange={(e) => {
                      setPersonalInfo({
                        ...personalInfo,
                        additionalPhone: e.target.checked ? '+31' : ''
                      });
                    }}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span className="text-lg font-medium text-gray-900">
                    {t('booking.personalInfo.addAdditionalPhone')}
                  </span>
                </label>

                {!!personalInfo.additionalPhone && (
                  <div className="flex rounded-lg shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      +31
                    </span>
                    <input
                      type="tel"
                      value={personalInfo.additionalPhone?.replace('+31', '') || ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setPersonalInfo({ ...personalInfo, additionalPhone: digits });
                      }}
                      placeholder="XXXXXXXXX"
                      className="block w-full border rounded-r-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Password fields for new users */}
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('auth.password')}
                    </h3>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={personalInfo.password}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, password: e.target.value })}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('auth.confirmPassword')}
                    </h3>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={personalInfo.confirmPassword}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, confirmPassword: e.target.value })}
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Booking for Someone Else */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalInfo.bookingForOther}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, bookingForOther: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-lg font-medium text-gray-900">
                  {t('booking.personalInfo.bookingForOther')}
                </span>
              </label>

              {personalInfo.bookingForOther && (
                <div className="space-y-6 pl-6 border-l-2 border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {t('booking.personalInfo.otherFullName')}
                      </h3>
                    </div>
                    <input
                      type="text"
                      value={personalInfo.otherFullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, otherFullName: e.target.value })}
                      placeholder={t('booking.personalInfo.otherFullNamePlaceholder')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                    {errors.otherFullName && <p className="text-red-500 text-sm">{errors.otherFullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {t('booking.personalInfo.otherPhoneNumber')}
                      </h3>
                    </div>
                    <div className="flex rounded-lg shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        +31
                      </span>
                      <input
                        type="tel"
                        value={personalInfo.otherPhoneNumber?.replace('+31', '') || ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                          setPersonalInfo({ ...personalInfo, otherPhoneNumber: `+31${digits}` });
                        }}
                        placeholder="XXXXXXXXX"
                        className="block w-full border rounded-r-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                    </div>
                    {errors.otherPhoneNumber && <p className="text-red-500 text-sm">{errors.otherPhoneNumber}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Company Name and Business Address Fields */}
            {personalInfo.bookingType === 'business' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" /> {/* Icon for Company Name */}
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('booking.personalInfo.companyName')}
                    </h3>
                  </div>
                  <input
                    type="text"
                    value={personalInfo.companyName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, companyName: e.target.value })}
                    placeholder={t('booking.personalInfo.companyNamePlaceholder')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" /> {/* Icon for Business Address */}
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('booking.personalInfo.businessAddress')}
                    </h3>
                  </div>
                  <LocationInput
                    value={personalInfo.businessAddress || null}
                    onChange={(place) => {
                      if (place) {
                        const location: Location = {
                          label: place.value.structured_formatting.main_text,
                          description: place.value.description,
                          mainAddress: place.value.description,
                          secondaryAddress: place.value.structured_formatting.secondary_text,
                          value: {
                            place_id: place.value.place_id,
                            description: place.value.description,
                            structured_formatting: {
                              main_text: place.value.structured_formatting.main_text,
                              secondary_text: place.value.structured_formatting.secondary_text,
                            },
                          },
                        };
                        setPersonalInfo({ ...personalInfo, businessAddress: location });
                      } else {
                        setPersonalInfo({ ...personalInfo, businessAddress: undefined });
                      }
                    }}
                    placeholder={t('booking.personalInfo.businessAddressPlaceholder')}
                    translations={{ ...translations, locale: i18n.language }}
                    onClear={() => setPersonalInfo({ ...personalInfo, businessAddress: undefined })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('booking.back')}
            </button>
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('common.loading') : t('booking.personalInfo.continue')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'booking'])),
    },
  }
};

export default PersonalInfoPage;