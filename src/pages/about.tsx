import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import type { NextPage } from 'next'
import Head from 'next/head'
import { 
    Clock, 
    CheckCircle, 
    Shield, 
    Target, 
    Award, 
    ThumbsUp, 
    Heart,
    Car,
    CreditCard,
    SmilePlus
} from 'lucide-react'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

const AboutPage: NextPage = () => {
    const { t } = useTranslation('common')

    const values = [
        {
            icon: <Heart className="w-6 h-6" />,
            title: t('about.values.customerFirst.title'),
            description: t('about.values.customerFirst.description')
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('about.values.safety.title'),
            description: t('about.values.safety.description')
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: t('about.values.integrity.title'),
            description: t('about.values.integrity.description')
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: t('about.values.innovation.title'),
            description: t('about.values.innovation.description')
        }
    ]

    const features = [
        {
            icon: <Clock className="w-6 h-6" />,
            title: t('about.features.availability.title'),
            description: t('about.features.availability.description')
        },
        {
            icon: <Car className="w-6 h-6" />,
            title: t('about.features.booking.title'),
            description: t('about.features.booking.description')
        },
        {
            icon: <Award className="w-6 h-6" />,
            title: t('about.features.drivers.title'),
            description: t('about.features.drivers.description')
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: t('about.features.pricing.title'),
            description: t('about.features.pricing.description')
        },
        {
            icon: <ThumbsUp className="w-6 h-6" />,
            title: t('about.features.comfort.title'),
            description: t('about.features.comfort.description')
        },
        {
            icon: <SmilePlus className="w-6 h-6" />,
            title: t('about.features.experience.title'),
            description: t('about.features.experience.description')
        }
    ]

    return (
        <>
            <Head>
                <title>{t('seo.about.title')}</title>
                <meta name="description" content={t('seo.about.description')} />
            </Head>
            <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white min-h-screen pt-32 pb-16 overflow-hidden">
                <AnimatedBackground />
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                            {t('about.title')}
                        </h1>
                        <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                            {t('about.subtitle')}
                        </p>
                    </motion.div>

                    {/* Welcome Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/20"
                    >
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            {t('about.welcome.title')}
                        </h2>
                        <p className="text-white/80 leading-relaxed">
                            {t('about.welcome.description')}
                        </p>
                    </motion.div>

                    {/* Mission Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/20"
                    >
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            {t('about.mission.title')}
                        </h2>
                        <p className="text-white/80 leading-relaxed">
                            {t('about.mission.description')}
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            {t('about.whyChooseUs')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                                >
                                    <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                                        <div className="text-white">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/80">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Values Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">
                            {t('about.ourValues')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                                >
                                    <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                                        <div className="text-white">
                                            {value.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-white/80">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    }
}

export default AboutPage