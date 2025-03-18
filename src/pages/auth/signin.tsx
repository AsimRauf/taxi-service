import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';

export default function SignIn() {
  const { t } = useTranslation('common');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || t('auth.invalidCredentials'));
      }
      
      login(data.token, data.user);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left Section - Brand Image */}
        <div className="hidden lg:block relative w-1/2 overflow-hidden">
          <Image
            src="/images/taxi-auth.jpg"
            alt="Taxi Service"
            fill
            className="object-cover opacity-40 mix-blend-multiply"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90" />
          <div className="relative h-full flex items-center p-12">
            <div className="max-w-xl text-white space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl xs:text-5xl font-bold tracking-tight">
                  {t('auth.welcomeBack')}
                </h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  {t('auth.signInMessage')}
                </p>
              </div>
              
              {/* Features List */}
              <div className="space-y-4 text-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{t('auth.feature1')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{t('auth.feature2')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{t('auth.feature3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center">
              <Link href="/" className="inline-block">
                <Image
                  src="/images/Logo.png"
                  alt="Logo"
                  width={160}
                  height={48}
                  className="h-12 w-auto"
                />
              </Link>
            </div>

            <div>
              <div className="text-center">
                <h2 className="text-2xl xs:text-3xl font-bold text-gray-900">
                  {t('auth.signInTitle')}
                </h2>
                <p className="mt-2 text-sm xs:text-base text-gray-600">
                  {t('auth.signInSubtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-700">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-secondary" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      className="block w-full pl-12 pr-4 h-[52px] text-base
                        border-2 border-gray-200 rounded-xl
                        focus:outline-none focus:border-secondary focus:ring-0
                        transition-all duration-200
                        placeholder:text-gray-400 text-gray-900
                        bg-white shadow-sm"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      placeholder={t('auth.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-700">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-secondary" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      className="block w-full pl-12 pr-12 h-[52px] text-base
                        border-2 border-gray-200 rounded-xl
                        focus:outline-none focus:border-secondary focus:ring-0
                        transition-all duration-200
                        placeholder:text-gray-400 text-gray-900
                        bg-white shadow-sm"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      placeholder={t('auth.passwordPlaceholder')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 
                        hover:text-secondary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile adjustments for the form container */}
                <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border-2 border-red-100 mb-6">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-secondary text-white font-semibold h-[52px] text-base
                      rounded-xl hover:bg-primary/90 focus:outline-none
                      transition-all duration-200 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-sm hover:shadow-md"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-secondary/30 border-t-secondary 
                          rounded-full animate-spin mr-2" />
                        {t('auth.signingIn')}
                      </div>
                    ) : (
                      t('auth.signIn')
                    )}
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {t('auth.or')}
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm">
                  <span className="text-gray-600">
                    {t('auth.noAccount')}{' '}
                  </span>
                  <Link
                    href="/auth/signup"
                    className="font-semibold text-secondary hover:text-secondary/80 transition-colors"
                  >
                    {t('auth.createAccount')}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
    },
  };
};
