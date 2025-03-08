import { Euro, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'
import { WebsiteTranslations } from '@/types/translations'
import { motion } from 'framer-motion'

interface FeaturesSectionProps {
  translations: WebsiteTranslations
}

export const FeaturesSection = ({ translations }: FeaturesSectionProps) => {
  const features = [
    {
      icon: <Euro className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
      title: translations.features.prices.title,
      description: translations.features.prices.description
    },
    {
      icon: <MapPin className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
      title: translations.features.coverage.title,
      description: translations.features.coverage.description
    },
    {
      icon: <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
      title: translations.features.reliability.title,
      description: translations.features.reliability.description
    }
  ]

  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="w-[95%] md:w-[90%] max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex items-start gap-3 md:gap-4"
            >
              <div className="bg-primary/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div>
                <h5 className="text-base md:text-lg font-bold mb-1 md:mb-2">{feature.title}</h5>
                <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative h-[250px] md:h-[400px]"
          >
            <Image
              src="/images/taxi-service.jpg"
              alt={translations.features.imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-xl"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
              {translations.features.heading}
            </h2>
            <div className="space-y-3 md:space-y-4 text-gray-600 text-sm md:text-base">
              <p>{translations.features.description1}</p>
              <p>{translations.features.description2}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
