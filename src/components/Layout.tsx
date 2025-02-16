import { Navbar } from './Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

interface LayoutProps {
    children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
    const { t } = useTranslation('common')
    const router = useRouter()

    const showHero = router.pathname === '/'

    const translations = {
        locale: router.locale || 'nl',
        hero: {
            title: t('hero.title'),
            subtitle: t('hero.subtitle'),
            formTitle: t('hero.formTitle'),
            pickup: t('hero.pickup'),
            pickupPlaceholder: t('hero.pickupPlaceholder'),
            destination: t('hero.destination'),
            destinationPlaceholder: t('hero.destinationPlaceholder'),
            addStopover: t('hero.addStopover'),
            swapLocations: t('hero.swapLocations'),
            stopover: t('hero.stopover'),
            removeStopover: t('hero.removeStopover'),
            pickupDateTime: t('hero.pickupDateTime'),
            returnTrip: t('hero.returnTrip'),
            returnDateTime: t('hero.returnDateTime'),
            luggage: t('hero.luggage'),
            travelers: t('hero.travelers'),
            person: t('hero.person'),
            people: t('hero.people'),
            calculate: t('hero.calculate'),
            returnPlaceholder: t('hero.returnPlaceholder')
        },
        nav: {
            login: t('nav.login'),
            services: t('nav.services'),
            contact: t('nav.contact'),
            aboutUs: t('nav.aboutUs'),
            service1: t('nav.service1'),
            service2: t('nav.service2'),
            profile: t('nav.profile'),
            signOut: t('nav.signOut')
        },
        auth: {
            createAccount: t('auth.createAccount'),
            fullName: t('auth.fullName'),
            nameRequired: t('auth.nameRequired'),
            emailRequired: t('auth.emailRequired'),
            invalidEmail: t('auth.invalidEmail'),
            phoneRequired: t('auth.phoneRequired'),
            invalidPhone: t('auth.invalidPhone'),
            passwordRequired: t('auth.passwordRequired'),
            passwordLength: t('auth.passwordLength'),
            passwordMatch: t('auth.passwordMatch'),
            genericError: t('auth.genericError'),
            creating: t('auth.creating'),
            create: t('auth.create'),
            haveAccount: t('auth.haveAccount'),
            signin: t('auth.signin'),
            password: t('auth.password'),
            phoneNumber: t('auth.phoneNumber'),
            confirmPassword: t('auth.confirmPassword')
        },
        booking: {
            title: t('booking.title'),
            from: t('booking.from'),
            to: t('booking.to'),
            distance: t('booking.distance'),
            duration: t('booking.duration'),
            passengers: t('booking.passengers'),
            luggage: t('booking.luggage'),
            yes: t('booking.yes'),
            no: t('booking.no'),
            pickupTime: t('booking.pickupTime'),
            returnTime: t('booking.returnTime'),
            totalPrice: t('booking.totalPrice'),
            returnIncluded: t('booking.returnIncluded'),
            back: t('booking.back'),
            bookNow: t('booking.bookNow')
        }
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            {showHero && <HeroSection translations={translations} />}
            <main>{children}</main>
        </div>
    )
}

export default Layout