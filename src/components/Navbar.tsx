import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import ReactCountryFlag from "react-country-flag"
import { Fragment, useState, useEffect } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { LogOut, UserCircle, BookOpen, Clock, User } from 'lucide-react'
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { BookingData } from '@/types/booking'


// Add these utility functions at the top of the file
const DROPDOWN_OFFSET = {
    profile: { x: -10, y: 10 },
    language: { x: -10, y: 10 },
    bookings: { x: 130, y: 10 }
};

const getDropdownPosition = (type: 'profile' | 'language' | 'bookings') => {
    return {
        transform: `translate(${DROPDOWN_OFFSET[type].x}px, ${DROPDOWN_OFFSET[type].y}px)`
    };
};

// Add this utility function at the top of the component
const truncateText = (text: string, maxLength: number = 8) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const Navbar = () => {
    const router = useRouter()
    const { t } = useTranslation('common', { useSuspense: false })
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [bookings, setBookings] = useState<BookingData[]>([])

    const { user, logout } = useAuth()
    const isLoggedIn = !!user


    useEffect(() => {
        const savedBookings = localStorage.getItem('allBookings')
        if (savedBookings) {
            setBookings(JSON.parse(savedBookings))
        }
    }, [])

    const changeLanguage = (locale: string) => {
        router.push(router.pathname, router.asPath, { locale })
    }

    return (
        // Update the navbar container for better small screen handling
        <div className="w-[95%] px-1 xs:px-2 sm:px-4 py-1 xs:py-2 sm:py-4 fixed top-0 left-0 right-0 z-50 mx-auto">
            <nav className="max-w-6xl mx-auto bg-white rounded-full shadow-lg px-1.5 xs:px-2 sm:px-6 py-1.5 xs:py-2 sm:py-3 flex items-center justify-between border border-secondary/20">
                {/* Logo - Make it smaller on tiny screens */}
                <div className="flex-shrink-0 mt-[3px] ml-[2px]">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/images/Logo.png"
                            alt="TaxiRitje Logo"
                            width={140}
                            height={20}
                            className="w-[100px] xs:w-[120px] sm:w-[140px] object-cover"
                        />
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
                {/* Update the right side elements with consistent positioning */}
                <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
                    {/* Bookings Dropdown */}
                    <Popover className="relative">
                        {({ open }) => (
                            <>
                                <Popover.Button className="flex items-center space-x-1 bg-primary/10 rounded-full px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-secondary hover:bg-primary/20 transition-all">
                                    <ShoppingCart className="h-4 w-4 xs:h-5 xs:w-5" />
                                    <span className="bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {bookings.length}
                                    </span>
                                </Popover.Button>

                                <Transition
                                    show={open}
                                    as={Fragment}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <Popover.Panel
                                        className="absolute right-0 z-50 mt-3 w-80 transform"
                                        style={getDropdownPosition('bookings')}
                                    >
                                        <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 bg-white">
                                            <div className="relative p-4">
                                                <h3 className="font-medium mb-2">{t('nav.pendingBookings')}</h3>
                                                {bookings.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {bookings.slice(0, 3).map(booking => (
                                                            <div key={booking.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                                                                <div className="text-sm">
                                                                    <p className="font-medium">{booking.pickup?.mainAddress}</p>
                                                                    <p className="text-gray-500">{new Date(booking.pickupDateTime).toLocaleDateString()}</p>
                                                                </div>
                                                                <span className="font-medium">€{booking.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 text-sm">{t('nav.noBookings')}</p>
                                                )}
                                                <Link
                                                    href="/booking/overview"
                                                    className="mt-3 block w-full text-center bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors"
                                                >
                                                    {t('nav.viewAll')}
                                                </Link>
                                            </div>
                                        </div>
                                    </Popover.Panel>
                                </Transition>
                            </>
                        )}
                    </Popover>

                    {/* Language Selector */}
                    <Popover className="relative">
                        {({ open }) => (
                            <>
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
                                    show={open}
                                    as={Fragment}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <Popover.Panel
                                        className="absolute right-0 z-50 mt-3 w-36 transform"
                                        style={getDropdownPosition('language')}
                                    >
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
                            </>
                        )}
                    </Popover>

                    {/* User Profile Button */}
                    {isLoggedIn ? (
                        <Popover className="relative">
                            {({ open }) => (
                                <>
                                    <Popover.Button className="flex items-center space-x-1 bg-primary/10 rounded-full px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-secondary hover:bg-primary/20 transition-all">
                                        <UserCircle className="h-4 w-4 xs:h-5 xs:w-5" />
                                        <span className="font-medium text-xs xs:text-sm max-w-[50px] xs:max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline">
                                            {truncateText(user.name)}
                                        </span>
                                        <ChevronDownIcon className="h-3 w-3 xs:h-4 xs:w-4" />
                                    </Popover.Button>


                                    <Transition
                                        show={open}
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                        <Popover.Panel 
                                            className="absolute right-0 z-50 mt-3 w-56 transform"
                                            style={getDropdownPosition('profile')}
                                        >
                                            <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 bg-white">
                                                {/* User Info Section */}
                                                <div className="px-4 py-3 border-b border-gray-200">
                                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
                                                </div>

                                                {/* Navigation Links */}
                                                <div className="p-2">
                                                    <div className="space-y-1">
                                                        {/* All Bookings */}
                                                        <Link
                                                            href="/account/bookings"
                                                            className="group flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary/10"
                                                        >
                                                            <BookOpen className="w-4 h-4 mr-3 text-gray-500 group-hover:text-secondary" />
                                                            <span className="text-gray-700 group-hover:text-secondary">
                                                                {t('nav.viewAll')}
                                                            </span>
                                                        </Link>

                                                        {/* Upcoming Rides */}
                                                        <Link
                                                            href="/account/upcoming"
                                                            className="group flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary/10"
                                                        >
                                                            <Clock className="w-4 h-4 mr-3 text-gray-500 group-hover:text-secondary" />
                                                            <span className="text-gray-700 group-hover:text-secondary">
                                                                {t('nav.upcomingRides')}
                                                            </span>
                                                        </Link>

                                                        {/* Edit Profile */}
                                                        <Link
                                                            href="/account/profile"
                                                            className="group flex items-center px-3 py-2 text-sm rounded-lg hover:bg-secondary/10"
                                                        >
                                                            <User className="w-4 h-4 mr-3 text-gray-500 group-hover:text-secondary" />
                                                            <span className="text-gray-700 group-hover:text-secondary">
                                                                {t('nav.profile')}
                                                            </span>
                                                        </Link>

                                                      

                                                        {/* Divider */}
                                                        <div className="h-px bg-gray-200 my-2" />

                                                        {/* Logout Button */}
                                                        <button
                                                            onClick={logout}
                                                            className="w-full group flex items-center px-3 py-2 text-sm rounded-lg hover:bg-red-50"
                                                        >
                                                            <LogOut className="w-4 h-4 mr-3 text-gray-500 group-hover:text-red-600" />
                                                            <span className="text-gray-700 group-hover:text-red-600">
                                                                {t('auth.logout')}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popover.Panel>
                                    </Transition>
                                </>
                            )}
                        </Popover>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className="hidden md:flex items-center space-x-1 bg-secondary text-white rounded-full px-1.5 xs:px-2 sm:px-4 py-1 xs:py-1.5 sm:py-2 hover:bg-secondary/90 transition-colors"
                        >
                            <span className="text-xs xs:text-sm whitespace-nowrap">{t('nav.login')}</span>
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden relative z-50 rounded-full p-1 xs:p-1.5 sm:p-2 text-secondary hover:bg-primary/10"
                    >
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="h-4 w-4 xs:h-5 xs:w-5" />
                        ) : (
                            <Bars3Icon className="h-4 w-4 xs:h-5 xs:w-5" />
                        )}
                    </button>
                </div>

                {/* Update Mobile Menu positioning */}
                <div
                    className={`fixed inset-x-0 top-[60px] xs:top-[68px] sm:top-[76px] p-2 md:hidden ${
                        isMobileMenuOpen ? 'block' : 'hidden'
                        }`}
                >
                    <Transition
                        show={isMobileMenuOpen}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="mx-auto max-w-xl bg-white shadow-lg rounded-2xl border border-secondary/10">
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
