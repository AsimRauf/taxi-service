import { BookingForm } from '@/components/forms/BookingForm'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { createTranslationsObject } from '@/utils/translations'
import { useRouter } from 'next/router'

const SchipholBookingPage = () => {
    const { t } = useTranslation()
    const router = useRouter()
    const translations = createTranslationsObject(t, router.locale || 'en')
    
    const schipholLocation = {
        label: "Amsterdam Airport Schiphol",
        mainAddress: "Amsterdam Airport Schiphol, Aankomstpassage 1, 1118 AX Schiphol, Netherlands",
        secondaryAddress: "Schiphol, Netherlands",
        description: "Amsterdam Airport Schiphol",
        value: {
            place_id: "ChIJLRb94DThxUcRiPHO8YMV1cc",
            description: "Amsterdam Airport Schiphol",
            structured_formatting: {
                main_text: "Amsterdam Airport Schiphol",
                secondary_text: "Schiphol, Netherlands",
                place_id: "ChIJLRb94DThxUcRiPHO8YMV1cc"
            }
        }
    }
    

    return (
        <section className="bg-gradient-to-b from-primary to-primary/90 pt-32 pb-16 p-6 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 lg:mt-[100px]">
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <BookingForm 
                        defaultDestination={schipholLocation} 
                        {...translations}
                    />
                </div>
                <div className="space-y-6 text-white">
                    <h1 className="text-4xl font-bold">
                        {t('airports.schiphol.title', 'Schiphol Airport Transfer')}
                    </h1>
                    <p className="text-white/80 text-lg">
                        {t('airports.schiphol.description', 
                            'Book your reliable airport transfer to and from Amsterdam Airport Schiphol. Fixed prices, professional drivers, and 24/7 service.')}
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

export default SchipholBookingPage
