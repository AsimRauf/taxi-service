import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import ReactCountryFlag from "react-country-flag"
import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export const Navbar = () => {
    const router = useRouter()
    const { t } = useTranslation('common', { useSuspense: false })
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const isLoggedIn = false

    const changeLanguage = (locale: string) => {
        router.push(router.pathname, router.asPath, { locale })
    }

    return (
        <div className="w-full px-2 sm:px-4 py-3 sm:py-6 fixed top-0 left-0 right-0 z-50 bg-white/0 backdrop-blur-sm">
            <nav className="max-w-7xl mx-auto bg-white rounded-full shadow-lg px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between border border-secondary/20">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Link href="/" className="font-montserrat text-xl sm:text-2xl font-bold text-secondary whitespace-nowrap">
                        <span className="text-primary">Taxi</span>Service
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    <Popover className="relative">
                        <Popover.Button className="flex items-center space-x-1 font-medium text-gray-700 hover:text-secondary transition-colors group">
                            <span>{t('nav.services')}</span>
                            <ChevronDownIcon className="h-4 w-4" />
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </Popover.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel className="absolute z-50 mt-3 w-48 transform">
                                <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black ring-opacity-5">
                                    <div className="relative bg-white p-1">
                                        <button className="block w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 rounded-lg text-left">
                                            {t('nav.service1')}
                                        </button>
                                        <button className="block w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 rounded-lg text-left">
                                            {t('nav.service2')}
                                        </button>
                                    </div>
                                </div>
                            </Popover.Panel>
                        </Transition>
                    </Popover>

                    <Link href="#about" className="relative group font-medium text-gray-700 hover:text-secondary transition-colors">
                        {t('nav.aboutUs')}
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </Link>

                    <Link href="#contact" className="relative group font-medium text-gray-700 hover:text-secondary transition-colors">
                        {t('nav.contact')}
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </Link>
                </div>

                {/* Right Side - Language & Auth */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <Popover className="relative">
                        <Popover.Button className="flex items-center space-x-1 bg-primary/10 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-secondary hover:bg-primary/20 transition-all">
                            <ReactCountryFlag
                                countryCode={router.locale === 'nl' ? 'NL' : 'GB'}
                                svg
                                style={{
                                    width: '1.2em',
                                    height: '1.2em',
                                }}
                            />
                            <span className="font-medium text-sm sm:text-base">{router.locale === 'nl' ? 'NL' : 'EN'}</span>
                            <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Popover.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel className="absolute right-0 z-50 mt-3 w-36 transform">
                                <div className="relative bg-white rounded-xl shadow-lg p-1">
                                    <button
                                        onClick={() => changeLanguage('nl')}
                                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-primary/10 rounded-lg"
                                    >
                                        <ReactCountryFlag
                                            countryCode="NL"
                                            svg
                                            style={{
                                                width: '1.2em',
                                                height: '1.2em',
                                            }}
                                        />
                                        <span>Dutch</span>
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('en')}
                                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-primary/10 rounded-lg"
                                    >
                                        <ReactCountryFlag
                                            countryCode="GB"
                                            svg
                                            style={{
                                                width: '1.2em',
                                                height: '1.2em',
                                            }}
                                        />
                                        <span>English</span>
                                    </button>
                                </div>
                            </Popover.Panel>
                        </Transition>
                    </Popover>

                    {isLoggedIn ? (
                        <Popover className="relative">
                            {/* User menu implementation */}
                        </Popover>
                    ) : (
                        <Link href="/login" className="hidden md:block bg-secondary text-white px-6 py-2 rounded-full hover:bg-secondary/90 transition-colors">
                            {t('nav.login')}
                        </Link>
                    )}

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden rounded-full p-1.5 sm:p-2 text-secondary hover:bg-primary/10"
                    >
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                            <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`absolute left-2 right-2 top-20 z-50 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                    <Transition
                        show={isMobileMenuOpen}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="bg-white shadow-lg rounded-2xl border border-secondary/10">
                            <div className="flex flex-col py-2">
                                <Link
                                    href="#services"
                                    className="px-4 py-2.5 text-base text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('nav.services')}
                                </Link>
                                <Link
                                    href="#about"
                                    className="px-4 py-2.5 text-base text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('nav.aboutUs')}
                                </Link>
                                <Link
                                    href="#contact"
                                    className="px-4 py-2.5 text-base text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('nav.contact')}
                                </Link>
                                {!isLoggedIn && (
                                    <Link
                                        href="/login"
                                        className="px-4 py-2.5 text-base text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('nav.login')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </Transition>
                </div>
            </nav>
        </div>
    )
}
