import { Euro, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { } from 'react'
import { useTranslation } from 'next-i18next'

const WaveBackground = ({ position }: { position: 'top' | 'bottom' }) => (
  <div
    className={`absolute left-0 w-full h-auto ${position === 'top' ? 'top-0' : 'bottom-0'}`}
    style={position === 'top' ? { transform: 'scaleY(-1)' } : {}}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
      <defs>
        <linearGradient id="feature-wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.1)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(147, 197, 253, 0.05)' }} />
        </linearGradient>
      </defs>
      <path 
        className="feature-wave" 
        fill="url(#feature-wave-gradient)" 
        fillOpacity="1" 
        d="M0,160L48,181.3C96,203,192,245,288,256C384,267,480,245,576,208C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </svg>
  </div>
)

const FloatingElement = ({ delay = 0, children }: { delay?: number; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="floating-element"
  >
    {children}
  </motion.div>
)

export const FeaturesSection = () => {
    const { t } = useTranslation('common')

    const features = [
        {
            icon: <Euro className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
            title: t('features.prices.title'),
            description: t('features.prices.description'),
        },
        {
            icon: <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
            title: t('features.coverage.title'),
            description: t('features.coverage.description'),
        },
        {
            icon: <Clock className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
            title: t('features.reliability.title'),
            description: t('features.reliability.description'),
        }
    ]

    return (
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
            <WaveBackground position="top" />
            <WaveBackground position="bottom" />
            
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="w-[95%] md:w-[90%] max-w-7xl mx-auto relative z-10">
                {/* Enhanced section header */}
                <div className="text-center mb-12 md:mb-16">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-block mb-4"
                    >
                        <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wide uppercase">
                            {t('features.whyChooseUs')}
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-primary"
                    >
                        {t('features.premiumFeatures')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                    >
                        {t('features.experienceDifference')}
                    </motion.p>
                </div>

                {/* Enhanced feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative bg-white/80 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl border border-white/20 overflow-hidden flex items-center gap-4 md:gap-6"
                        >
                            {/* Icon with plain background */}
                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/10 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 shrink-0">
                                {feature.icon}
                            </div>
                            
                            <div className="flex-grow">
                                <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800 group-hover:text-primary transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                            
                            {/* Decorative element */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        </motion.div>
                    ))}
                </div>

                {/* Enhanced content section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center p-8 md:p-12">
                    <FloatingElement delay={0.3}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                            <div className="relative h-[350px] md:h-[420px] rounded-2xl overflow-hidden shadow-xl">
                                <Image
                                    src="/images/taxi-service.jpg"
                                    alt={t('features.imageAlt')}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 95vw, 50vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                            </div>
                        </motion.div>
                    </FloatingElement>
                    
                    <FloatingElement delay={0.5}>
                        <div className="space-y-8">
                            <div>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '3rem' }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="h-1 bg-gradient-to-r from-primary to-indigo-500 rounded-full mb-4"
                                ></motion.div>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-gray-800 leading-tight">
                                    {t('features.heading')}
                                </h2>
                            </div>
                            
                            <div className="space-y-5 text-gray-600 text-base md:text-lg leading-relaxed">
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.7 }}
                                    className="relative pl-6"
                                >
                                    <span className="absolute left-0 top-2 w-2 h-2 bg-primary rounded-full"></span>
                                    {t('features.description1')}
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.9 }}
                                    className="relative pl-6"
                                >
                                    <span className="absolute left-0 top-2 w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    {t('features.description2')}
                                </motion.p>
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 1.1 }}
                                className="pt-2"
                            >
                                <button className="group relative px-7 py-3 bg-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                                    <span className="relative z-10">{t('features.learnMore')}</span>
                                </button>
                            </motion.div>
                        </div>
                    </FloatingElement>
                </div>
            </div>

            <style jsx>{`
                .feature-wave {
                    animation: gentle-wave 12s infinite ease-in-out;
                }
                
                .floating-element {
                    animation: float 6s ease-in-out infinite;
                }
                
                @keyframes gentle-wave {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </section>
    )
}
