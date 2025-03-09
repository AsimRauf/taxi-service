import { BookingForm } from '@/components/forms/BookingForm'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { createTranslationsObject } from '@/utils/translations'
import { useRouter } from 'next/router'

const RotterdamBookingPage = () => {
    const { t } = useTranslation()
    const router = useRouter()
    const translations = createTranslationsObject(t, router.locale || 'en')
    
    const rotterdamLocation = {
        label: "Rotterdam The Hague Airport",
        mainAddress: "Rotterdam The Hague Airport, Rotterdam Airportplein 60, 3045 AP Rotterdam, Netherlands",
        secondaryAddress: "Rotterdam, Netherlands",
        description: "Rotterdam The Hague Airport",
        value: {
            place_id: "ChIJB7xGnVu3xUcRuKn_D2YQXDs",
            description: "Rotterdam The Hague Airport",
            structured_formatting: {
                main_text: "Rotterdam The Hague Airport",
                secondary_text: "Rotterdam, Netherlands",
                place_id: "ChIJB7xGnVu3xUcRuKn_D2YQXDs"
            }
        }
    }

    return (
        <section className="bg-gradient-to-b from-primary to-primary/90 pt-32 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4">
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <BookingForm 
                        defaultDestination={rotterdamLocation}
                        {...translations}
                    />
                </div>
                <div className="space-y-6 text-white">
                    <h1 className="text-4xl font-bold">
                        {t('airports.rotterdam.title', 'Rotterdam Airport Transfer')}
                    </h1>
                    <p className="text-white/80 text-lg">
                        {t('airports.rotterdam.description', 
                            'Book your reliable airport transfer to and from Rotterdam The Hague Airport. Fixed prices, professional drivers, and 24/7 service.')}
                    </p>
                    <ul className="space-y-4 text-white/80">
                        <li className="flex items-center gap-2">
                            ✓ {t('airports.features.fixedPrice', 'Fixed price guarantee')}
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ {t('airports.features.service24h', '24/7 service available')}
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ {t('airports.features.flightTracking', 'Free flight tracking')}
                        </li>
                        <li className="flex items-center gap-2">
                            ✓ {t('airports.features.meetGreet', 'Meet & Greet service')}
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
        },
    }
}

export default RotterdamBookingPage
