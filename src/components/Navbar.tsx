import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import ReactCountryFlag from "react-country-flag"
import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { LogOut, UserCircle } from 'lucide-react'
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

// Add this utility function at the top of the component
const truncateText = (text: string, maxLength: number = 8) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const Navbar = () => {
    const router = useRouter()
    const { t } = useTranslation('common', { useSuspense: false })
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, logout } = useAuth()
    const isLoggedIn = !!user

    const changeLanguage = (locale: string) => {
        router.push(router.pathname, router.asPath, { locale })
    }

    return (
        // Update the navbar container for better small screen handling
        <div className="w-full px-1 xs:px-2 sm:px-4 py-1 xs:py-2 sm:py-4 fixed top-0 left-0 right-0 z-50 bg-white/0 backdrop-blur-sm">
            <nav className="max-w-7xl mx-auto bg-white rounded-full shadow-lg px-1.5 xs:px-2 sm:px-6 py-1.5 xs:py-2 sm:py-3 flex items-center justify-between border border-secondary/20">
                {/* Logo - Make it smaller on tiny screens */}
                <div className="flex-shrink-0">
                    <Link href="/" className="font-montserrat text-base xs:text-lg sm:text-xl font-bold text-secondary whitespace-nowrap">
                        <span className="text-primary">Taxi</span>Ritje
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
                {/* Update the right side elements */}
                <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
                    {/* Language Selector - Make it more compact */}
                    <Popover className="relative">
                        <Popover.Button className="flex items-center space-x-1 bg-primary/10 rounded-full px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-secondary hover:bg-primary/20 transition-all">
                            <ReactCountryFlag
                                countryCode={router.locale === 'nl' ? 'NL' : 'GB'}
                                svg
                                style={{
                                    width: '1em',
                                    height: '1em',
                                }}
                            />
                            <span className="font-medium text-xs xs:text-sm">
                                {router.locale === 'nl' ? 'NL' : 'EN'}
                            </span>
                            <ChevronDownIcon className="h-3 w-3 xs:h-4 xs:w-4" />
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

                    {/* User Profile Button - Make it consistent with language selector */}
                    {isLoggedIn ? (
                        <Popover className="relative">
                            <Popover.Button className="flex items-center space-x-1 bg-primary/10 rounded-full px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-secondary hover:bg-primary/20 transition-all">
                                <UserCircle className="h-4 w-4 xs:h-5 xs:w-5" />
                                <span className="font-medium text-xs xs:text-sm max-w-[50px] xs:max-w-[70px] sm:max-w-[100px] truncate">
                                    {truncateText(user.name)}
                                </span>
                                <ChevronDownIcon className="h-3 w-3 xs:h-4 xs:w-4" />
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
                                <Popover.Panel className="absolute right-0 z-50 mt-3 w-48 transform">
                                    <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="relative bg-white p-1">
                                            <Link
                                                href="/profile"
                                                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 rounded-lg"
                                            >
                                                <UserCircle className="h-4 w-4 mr-2" />
                                                {t('nav.profile')}
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                {t('nav.signOut')}
                                            </button>
                                        </div>
                                    </div>
                                </Popover.Panel>
                            </Transition>
                        </Popover>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className="hidden md:flex items-center space-x-1 bg-secondary text-white rounded-full px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 hover:bg-secondary/90 transition-colors"
                        >
                            <span className="text-xs xs:text-sm whitespace-nowrap">{t('nav.login')}</span>
                        </Link>
                    )}

                    {/* Mobile Menu Button - Make it consistent */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden rounded-full p-1 xs:p-1.5 sm:p-2 text-secondary hover:bg-primary/10"
                    >
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="h-4 w-4 xs:h-5 xs:w-5" />
                        ) : (
                            <Bars3Icon className="h-4 w-4 xs:h-5 xs:w-5" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`absolute left-2 right-2 top-10 mt-2 z-50 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
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
                                {/* Update mobile menu user section */}
                                {isLoggedIn && (
                                    <div className="px-3 py-2 border-b border-gray-200">
                                        <div className="flex items-center space-x-2">
                                            <UserCircle className="h-4 w-4 text-gray-500" />
                                            <span className="text-xs xs:text-sm font-medium text-gray-700 truncate">
                                                {truncateText(user.name, 15)}
                                            </span>
                                        </div>
                                    </div>
                                )}
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
                                {isLoggedIn ? (
                                    <>
                                        <Link
                                            href="/profile"
                                            className="px-4 py-2.5 text-base text-gray-700 hover:bg-primary/10 hover:text-secondary transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {t('nav.profile')}
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="px-4 py-2.5 text-base text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            {t('nav.signOut')}
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/auth/signin"
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
