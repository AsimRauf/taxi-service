import { BookingForm } from '@/components/forms/BookingForm'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { createTranslationsObject } from '@/utils/translations'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { 
  Plane, 
  Clock, 
  Shield, 
  Star, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Users, 
  Luggage,
  CreditCard,
  Wifi,
  Coffee
} from 'lucide-react'
import Head from 'next/head'
import { Footer } from '@/components/Footer'
import { fixedRoutes } from '@/data/fixedPrice'

const WaveBackground = ({ position }: { position: 'top' | 'bottom' }) => (
  <div
    className={`absolute left-0 w-full h-auto z-0 ${position === 'top' ? 'top-0' : 'bottom-0'}`}
    style={position === 'top' ? { transform: 'scaleY(-1)' } : {}}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
      <defs>
        <linearGradient id={`wave-gradient-${position}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.1)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0.05)' }} />
        </linearGradient>
      </defs>
      <path 
        className={`wave-${position}`} 
        fill={`url(#wave-gradient-${position})`} 
        fillOpacity="1" 
        d="M0,160L48,181.3C96,203,192,245,288,256C384,267,480,245,576,208C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </svg>
  </div>
)

const FloatingShapes = () => (
  <>
    <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-float-slow"></div>
    <div className="absolute top-40 right-20 w-32 h-32 bg-white/3 rounded-full blur-2xl animate-float-medium"></div>
    <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-white/4 rounded-full blur-lg animate-float-fast"></div>
  </>
)

const FeatureCard = ({ icon: Icon, title, description, delay }: {
  icon: React.ElementType,
  title: string,
  description: string,
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
  >
    <div className="bg-secondary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/80 text-sm">{description}</p>
  </motion.div>
)

const PriceCard = ({ from, to, price, vehicle, delay }: {
  from: string,
  to: string,
  price: number,
  vehicle: string,
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-white font-medium">{from} → {to}</p>
        <p className="text-white/70 text-sm">{vehicle}</p>
      </div>
      <div className="text-right">
        <p className="text-secondary font-bold text-lg">€{price.toFixed(2)}</p>
        <p className="text-white/70 text-xs">Fixed price</p>
      </div>
    </div>
  </motion.div>
)

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

    const features = [
        {
            icon: Shield,
            title: t('airports.features.safeReliable'),
            description: t('airports.features.safeReliableDesc')
        },
        {
            icon: Clock,
            title: t('airports.features.service24h'),
            description: t('airports.features.service24hDesc')
        },
        {
            icon: Star,
            title: t('airports.features.flightTracking'),
            description: t('airports.features.flightTrackingDesc')
        },
        {
            icon: Users,
            title: t('airports.features.meetGreet'),
            description: t('airports.features.meetGreetDesc')
        },
        {
            icon: Luggage,
            title: t('airports.features.freeLuggage'),
            description: t('airports.features.freeLuggageDesc')
        },
        {
            icon: CreditCard,
            title: t('airports.features.fixedPrice'),
            description: t('airports.features.fixedPriceDesc')
        }
    ]

    const popularRoutes = Object.entries(fixedRoutes["Amsterdam Airport Schiphol (AMS)"]).flatMap(([destination, prices]) => 
        Object.entries(prices).map(([vehicle, price]) => ({
            from: "Schiphol",
            to: destination,
            price: price,
            vehicle: vehicle === 'stationWagon' ? 'Station Wagon' : 'Bus'
        }))
    ).slice(0, 6);

    return (
        <>
            <Head>
                <title>{t('airports.schiphol.pageTitle')}</title>
                <meta name="description" content={t('airports.schiphol.metaDescription')} />
                <meta name="keywords" content={t('airports.schiphol.metaKeywords')} />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
                <WaveBackground position="top" />
                <WaveBackground position="bottom" />
                <FloatingShapes />

                {/* Hero Section */}
                <section className="pt-32 pb-16 p-2 lg:p-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 lg:mt-[100px]">
                        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20">
                            <BookingForm 
                                defaultDestination={schipholLocation} 
                                {...translations}
                            />
                        </div>
                        
                        <div className="space-y-6 text-white">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Plane className="w-8 h-8 text-secondary" />
                                    <span className="px-4 py-2 bg-secondary/20 rounded-full text-sm font-semibold">
                                        Amsterdam Schiphol
                                    </span>
                                </div>
                                
                                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                                    {t('airports.schiphol.title')}
                                </h1>
                                
                                <p className="text-white/90 text-lg leading-relaxed">
                                    {t('airports.schiphol.description')}
                                </p>
                            </motion.div>

                            <motion.ul 
                                className="space-y-4 text-white/90"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                                    <span>{t('airports.features.fixedPrice')}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                                    <span>{t('airports.features.service24h')}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                                    <span>{t('airports.features.flightTracking')}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                                    <span>{t('airports.features.meetGreet')}</span>
                                </li>
                            </motion.ul>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="pt-6"
                            >
                                <a 
                                    href="tel:0850607086" 
                                    className="inline-flex items-center gap-3 px-6 py-4 bg-secondary text-white font-bold text-lg rounded-full shadow-xl hover:shadow-secondary/25 transition-all duration-300 hover:scale-105"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>{t('airports.schiphol.callNow')}</span>
                                </a>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 relative z-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">{t('airports.schiphol.whyChoose')}</h2>
                            <p className="text-white/80 text-lg max-w-2xl mx-auto">
                                {t('airports.schiphol.whyChooseDesc')}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <FeatureCard
                                    key={index}
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                    delay={index * 0.1}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Popular Routes Section */}
                <section className="py-16 relative z-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">{t('airports.schiphol.popularRoutes')}</h2>
                            <p className="text-white/80 text-lg">{t('airports.schiphol.popularRoutesDesc')}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                            {popularRoutes.map((route, index) => (
                                <PriceCard
                                    key={index}
                                    from={route.from}
                                    to={route.to}
                                    price={route.price}
                                    vehicle={route.vehicle}
                                    delay={index * 0.1}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Airport Info Section */}
                <section className="py-16 relative z-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-white"
                            >
                                <h2 className="text-3xl font-bold mb-6">{t('airports.schiphol.aboutTitle')}</h2>
                                <div className="space-y-4 text-white/90">
                                    <p>
                                        {t('airports.schiphol.aboutDesc1')}
                                    </p>
                                    <p>
                                        {t('airports.schiphol.aboutDesc2')}
                                    </p>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-6">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                        <MapPin className="w-6 h-6 text-secondary mb-2" />
                                        <h3 className="font-semibold mb-1">{t('airports.schiphol.location')}</h3>
                                        <p className="text-sm text-white/80">{t('airports.schiphol.locationDesc')}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                        <Plane className="w-6 h-6 text-secondary mb-2" />
                                        <h3 className="font-semibold mb-1">{t('airports.schiphol.terminals')}</h3>
                                        <p className="text-sm text-white/80">{t('airports.schiphol.terminalsDesc')}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
                            >
                                <h3 className="text-2xl font-bold text-white mb-6">{t('airports.schiphol.amenities')}</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-white/90">
                                        <Wifi className="w-5 h-5 text-secondary" />
                                        <span>{t('airports.schiphol.wifi')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/90">
                                        <Coffee className="w-5 h-5 text-secondary" />
                                        <span>{t('airports.schiphol.restaurants')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/90">
                                        <Luggage className="w-5 h-5 text-secondary" />
                                        <span>{t('airports.schiphol.luggageStorage')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/90">
                                        <Star className="w-5 h-5 text-secondary" />
                                        <span>{t('airports.schiphol.dutyFree')}</span>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-secondary/20 rounded-xl">
                                    <h4 className="font-semibold text-white mb-2">{t('airports.schiphol.pickupLocation')}</h4>
                                    <p className="text-white/80 text-sm">
                                        {t('airports.schiphol.pickupLocationDesc')}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <style jsx>{`
                    @keyframes float-slow {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(180deg); }
                    }
                    
                    @keyframes float-medium {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-15px) rotate(90deg); }
                    }
                    
                    @keyframes float-fast {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-10px) rotate(270deg); }
                    }

                    .animate-float-slow {
                        animation: float-slow 8s ease-in-out infinite;
                    }
                    
                    .animate-float-medium {
                        animation: float-medium 6s ease-in-out infinite;
                    }
                    
                    .animate-float-fast {
                        animation: float-fast 4s ease-in-out infinite;
                    }

                    .wave-top,
                    .wave-bottom {
                        animation: wave-animation 12s infinite ease-in-out;
                    }

                    @keyframes wave-animation {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(10px); }
                        100% { transform: translateY(0); }
                    }
                `}</style>
            </div>

            <Footer />
        </>
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
