import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown, Car, Plane, Heart, Briefcase, MapPin, Music } from 'lucide-react'
import { useTranslation } from 'next-i18next'

export const ServicesSection = () => {
    const { t } = useTranslation('common')
    const [activeTab, setActiveTab] = useState<string | null>(null)
  
    const services = [
      {
        title: t('services.local.title'),
        image: '/images/local-taxi.jpg',
        icon: <Car className="w-6 h-6" />,
        description: t('services.local.description'),
        expandContent: null
      },
      {
        title: t('services.airport.title'),
        image: '/images/airport-taxi.jpg',
        icon: <Plane className="w-6 h-6" />,
        description: t('services.airport.description'),
        expandContent: [
          { name: t('services.airport.airports.amsterdam'), link: '/booking/ams-airport' },
          { name: t('services.airport.airports.rotterdam'), link: '/booking/rotterdam-hague-airport' },
          { name: t('services.airport.airports.eindhoven'), link: '/booking/eindhoven-airport' }
        ]
      },
      {
        title: t('services.care.title'),
        image: '/images/care-taxi.webp',
        icon: <Heart className="w-6 h-6" />,
        description: t('services.care.description'),
        expandContent: null
      },
      {
        title: t('services.business.title'),
        image: '/images/business-taxi.jpg',
        icon: <Briefcase className="w-6 h-6" />,
        description: t('services.business.description'),
        expandContent: null
      },
      {
        title: t('services.popular.title'),
        image: '/images/popular-taxi.jpg',
        icon: <MapPin className="w-6 h-6" />,
        description: t('services.popular.description'),
        expandContent: [
          { name: t('services.popular.locations.walibi'), link: '/booking/walibi' },
          { name: t('services.popular.locations.efteling'), link: '/booking/efteling' },
          { name: t('services.popular.locations.gelredome'), link: '/booking/gelredome' }
        ]
      },
      {
        title: t('services.event.title'),
        image: '/images/event-taxi.webp',
        icon: <Music className="w-6 h-6" />,
        description: t('services.event.description'),
        expandContent: null
      }
    ]
  
    return (
      <section id="services" className="bg-gradient-to-b from-primary to-primary/90 text-white py-16">
        <div className="w-[95%] md:w-[90%] max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('services.title')}</h2>
            <p className="text-white/80 max-w-2xl mx-auto">{t('services.subtitle')}</p>
          </motion.div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white text-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden group">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                    <div className="bg-primary p-2 rounded-lg">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {service.expandContent && (
                    <div>
                      <button
                        onClick={() => setActiveTab(activeTab === service.title ? null : service.title)}
                        className="flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
                      >
                        {t('services.airport.viewOptions')}
                        <ChevronDown className={`w-5 h-5 transition-transform ${activeTab === service.title ? 'rotate-180' : ''}`} />
                      </button>
                      {activeTab === service.title && (
                        <div className="mt-4 space-y-2">
                          {service.expandContent.map((item, i) => (
                            <Link
                              key={i}
                              href={item.link}
                              className="block p-4 bg-gray-50 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 group"
                            >
                              <div className="flex items-center justify-between">
                                <span>{item.name}</span>
                                <ChevronDown className="w-5 h-5 -rotate-90 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    )
  }

