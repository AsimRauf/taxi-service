import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'next-i18next'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
    },
  }
}
export default function SignIn() {
  const { t } = useTranslation('common')
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || t('auth.invalidCredentials'))
      }
      
      login(data.token, data.user)
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.unknownError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center bg-gradient-to-br from-primary to-white">
      {/* Left Side - Title Section */}
      <div className="w-full lg:w-1/2 px-4 lg:px-12 py-8 lg:py-0">
        <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-start">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold text-white mb-6 mt-14 lg:mt-0">
            {t('auth.signInTitle')}
          </h1>
          <p className="text-lg lg:text-xl text-white/80">
            {t('auth.signInMessage')}
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 px-4 lg:px-12 py-8 lg:py-0 mt-[-24px] lg:mt-32">
      <div className="max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="block w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors border-gray-300"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    className="block w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors border-gray-300"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-primary bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-base font-medium">{t('auth.signingIn')}</span>
                  </div>
                ) : (
                  <span className="text-base font-medium">{t('auth.signIn')}</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {t('auth.noAccount')}
                </span>
                <Link
                  href="/auth/signup"
                  className="ml-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  {t('auth.createAccount')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
