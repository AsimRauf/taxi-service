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
        <div className="w-full px-4 py-6">
            <nav className="max-w-7xl mx-auto bg-white rounded-full shadow-lg px-8 py-4 flex items-center justify-between border border-secondary/20">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Link href="/" className="font-montserrat text-2xl font-bold text-secondary">
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
                                    <div className="relative bg-white">
                                        <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 w-full text-left">
                                            {t('nav.service1')}
                                        </button>
                                        <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 w-full text-left">
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
                <div className="flex items-center space-x-4">
                    <Popover className="relative">
                        <Popover.Button className="flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 text-secondary hover:bg-primary/20 transition-all">
                            <ReactCountryFlag
                                countryCode={router.locale === 'nl' ? 'NL' : 'GB'}
                                svg
                                style={{
                                    width: '1.5em',
                                    height: '1.5em',
                                }}
                            />
                            <span className="font-medium">{router.locale === 'nl' ? 'NL' : 'EN'}</span>
                            <ChevronDownIcon className="h-4 w-4" />
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
                            <Popover.Panel className="absolute right-0 z-50 mt-3 w-32 transform">
                                <div className="relative bg-white">
                                    <button
                                        onClick={() => changeLanguage('nl')}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 w-full"
                                    >
                                        <ReactCountryFlag
                                            countryCode="NL"
                                            svg
                                            style={{
                                                width: '1.5em',
                                                height: '1.5em',
                                            }}
                                        />
                                        <span>Dutch</span>
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('en')}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 w-full"
                                    >
                                        <ReactCountryFlag
                                            countryCode="GB"
                                            svg
                                            style={{
                                                width: '1.5em',
                                                height: '1.5em',
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
                            {/* User menu stays the same */}
                        </Popover>
                    ) : (
                        <Link href="/login" className="hidden md:block bg-secondary text-white px-6 py-2 rounded-full hover:bg-secondary/90 transition-colors">
                            {t('nav.login')}
                        </Link>
                    )}

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden rounded-full p-2 text-secondary hover:bg-primary/10"
                    >
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`absolute inset-x-0 top-24 z-50 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                    <Transition
                        show={isMobileMenuOpen}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="mx-4 bg-white shadow-lg rounded-2xl border border-secondary/10">
                            <div className="flex flex-col py-4">
                                <Link
                                    href="#services"
                                    className="px-6 py-3 text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('nav.services')}
                                </Link>
                                <Link
                                    href="#about"
                                    className="px-6 py-3 text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('nav.aboutUs')}
                                </Link>
                                <Link
                                    href="#contact"
                                    className="px-6 py-3 text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {t('nav.contact')}
                                </Link>
                                {!isLoggedIn && (
                                    <Link
                                        href="/login"
                                        className="px-6 py-3 text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
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