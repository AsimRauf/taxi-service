import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'next-i18next'

export const SignUpForm = () => {
    const router = useRouter()
    const { t } = useTranslation('common')

    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = t('auth.nameRequired')
        }

        if (!formData.email) {
            newErrors.email = t('auth.emailRequired')
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('auth.invalidEmail')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = t('auth.phoneRequired')
        } else if (!/^[0-9]{11}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = t('auth.invalidPhone')
        }

        if (!formData.password) {
            newErrors.password = t('auth.passwordRequired')
        } else if (formData.password.length < 8) {
            newErrors.password = t('auth.passwordLength')
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.passwordMatch')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2)
        }
    }

    const handleBack = () => {
        setStep(1)
        setErrors({})
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep2()) return

        setIsLoading(true)
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    phoneNumber: `+31${formData.phoneNumber}`
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || t('auth.genericError'))
            router.push('/auth/signin')
        } catch (error: unknown) {
            setErrors({ submit: error instanceof Error ? error.message : String(error) })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row items-center">
            {/* Left Side - Title Section */}
            <div className="w-full lg:w-1/2 px-4 lg:px-12 py-8 lg:py-0 flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="lg:ml-10 max-w-xl mx-auto lg:mx-0">
                    <h1 className="text-4xl lg:text-6xl font-heading font-bold text-white mb-6 mt-8 lg:mt-0">
                        {t('auth.createAccount')}
                    </h1>

                    <p className="text-lg lg:text-xl text-white/80">
                        {t('auth.welcomeMessage')}
                    </p>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full lg:w-1/2 px-4 lg:px-12 py-8">
                <div className="max-w-md mx-auto">
                    {/* Progress Indicator */}
                    <div className="flex justify-center space-x-4 mb-8 mt-[-50px] lg:mt-16 lg:mb-12">
                        <div className={`h-2 w-16 rounded-full transition-colors duration-300 ${step === 1 ? 'bg-secondary' : 'bg-white/50'}`} />
                        <div className={`h-2 w-16 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-secondary' : 'bg-white/50'}`} />
                    </div>


                    {/* Form Container */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="text-center lg:text-left mb-8">
                                    <h3 className="text-2xl font-medium text-gray-900">
                                        {t('auth.personalInfo')}
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        {t('auth.stepOneDesc')}
                                    </p>
                                </div>

                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        {t('auth.fullName')}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        autoComplete="name"
                                        className={`block w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        className={`block w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Continue Button */}
                                <button
                                    onClick={handleNext}
                                    className="group w-full flex items-center justify-center py-3 px-4 rounded-lg text-primary bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300"
                                >
                                    <span className="text-base font-medium">{t('auth.continue')}</span>
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center lg:text-left mb-8">
                                    <h3 className="text-2xl font-medium text-gray-900">
                                        {t('auth.securityInfo')}
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        {t('auth.stepTwoDesc')}
                                    </p>
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        {t('auth.phoneNumber')}
                                    </label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            +31
                                        </span>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            autoComplete="tel"
                                            className={`block w-full border rounded-r-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        {t('auth.password')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            autoComplete="new-password"
                                            className={`block w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                    {errors.password && (
                                        <p className="text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        {t('auth.confirmPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            autoComplete="new-password"
                                            className={`block w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleBack}
                                        className="group flex-1 flex items-center justify-center py-3 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                        <span className="text-base font-medium text-gray-700">{t('auth.back')}</span>
                                    </button>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-primary bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-300"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-base font-medium">{t('auth.creating')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-base font-medium">{t('auth.create')}</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {errors.submit && (
                            <p className="mt-4 text-center text-sm text-red-600">
                                {errors.submit}
                            </p>
                        )}

                        {/* Sign In Link */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <span className="text-sm text-gray-500">
                                    {t('auth.haveAccount')}
                                </span>
                                <Link
                                    href="/auth/signin"
                                    className="ml-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                                >
                                    {t('auth.signin')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}