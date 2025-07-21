import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Car, Plane, Heart, Briefcase, MapPin, Music } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { ServiceCard } from './ServiceCard'

const WaveBackground = ({ position }: { position: 'top' | 'bottom' }) => (
  <div
    className={`absolute left-0 w-full h-auto z-0 ${position === 'top' ? 'top-0' : 'bottom-0'}`}
    style={position === 'top' ? { transform: 'scaleY(-1)' } : {}}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
      <defs>
        <linearGradient id={`wave-gradient-services-${position}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.1)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0.05)' }} />
        </linearGradient>
        <linearGradient id={`wave-gradient-2-services-${position}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.08)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0.03)' }} />
        </linearGradient>
      </defs>
      <path 
        className={`wave-services-1-${position}`} 
        fill={`url(#wave-gradient-services-${position})`} 
        fillOpacity="1" 
        d="M0,160L48,181.3C96,203,192,245,288,256C384,267,480,245,576,208C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
      <path 
        className={`wave-services-2-${position}`} 
        fill={`url(#wave-gradient-2-services-${position})`} 
        fillOpacity="1" 
        d="M0,224L48,213.3C96,203,192,181,288,192C384,203,480,245,576,256C672,267,768,245,864,213.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </svg>
  </div>
)

const DotPattern = ({ top, left, right, bottom, uniqueId }: { 
  top?: string, 
  left?: string, 
  right?: string, 
  bottom?: string, 
  uniqueId: string 
}) => (
  <div
    className="absolute z-0 opacity-60"
    style={{ top, left, right, bottom, width: '300px', height: '300px' }}
  >
    <svg width="100%" height="100%">
      <defs>
        <pattern id={`dot-pattern-${uniqueId}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2" fill="rgba(255, 255, 255, 0.3)" />
        </pattern>
        <mask id={`fade-mask-${uniqueId}`}>
          <rect width="100%" height="100%" fill={`url(#gradient-mask-${uniqueId})`} />
        </mask>
        <radialGradient id={`gradient-mask-${uniqueId}`}>
          <stop offset="0%" stopColor="white" />
          <stop offset="70%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect 
        width="100%" 
        height="100%" 
        fill={`url(#dot-pattern-${uniqueId})`} 
        mask={`url(#fade-mask-${uniqueId})`} 
      />
    </svg>
  </div>
)

const FloatingShapes = () => (
  <>
    <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-float-slow"></div>
    <div className="absolute top-40 right-20 w-32 h-32 bg-white/3 rounded-full blur-2xl animate-float-medium"></div>
    <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-white/4 rounded-full blur-lg animate-float-fast"></div>
    <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-white/3 rounded-full blur-xl animate-float-slow"></div>
  </>
)

export const ServicesSection = () => {
  const { t } = useTranslation('common')

  const services = useMemo(() => [
    {
      title: t('services.local.title'),
      image: '/images/local-taxi.jpg',
      Icon: Car,
      description: t('services.local.description'),
      expandContent: null
    },
    {
      title: t('services.airport.title'),
      image: '/images/airport-taxi.jpg',
      Icon: Plane,
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
      Icon: Heart,
      description: t('services.care.description'),
      expandContent: null
    },
    {
      title: t('services.business.title'),
      image: '/images/business-taxi.jpg',
      Icon: Briefcase,
      description: t('services.business.description'),
      expandContent: null
    },
    {
      title: t('services.popular.title'),
      image: '/images/popular-taxi.jpg',
      Icon: MapPin,
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
      Icon: Music,
      description: t('services.event.description'),
      expandContent: null
    }
  ], [t])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  }

  return (
    <section 
      id="services" 
      className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white py-16 md:py-24 overflow-hidden"
    >
      {/* Background Elements */}
      <WaveBackground position="top" />
      <WaveBackground position="bottom" />
      <FloatingShapes />
      
      {/* Enhanced Dot Patterns */}
      <DotPattern top="10%" right="5%" uniqueId="top-right" />
      <DotPattern bottom="15%" left="8%" uniqueId="bottom-left" />
      <DotPattern top="60%" left="3%" uniqueId="middle-left" />
      <DotPattern top="30%" right="10%" uniqueId="middle-right" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent z-0"></div>
      
      <div className="w-[95%] md:w-[90%] max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.span 
            className="inline-block px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-full text-sm font-semibold tracking-wide uppercase border border-white/20 shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {t('services.ourOfferings')}
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold my-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('services.title')}
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t('services.subtitle')}
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {services.map((service, index) => (
            <ServiceCard 
              key={`service-${index}`} 
              service={service} 
              index={index} 
            />
          ))}
        </motion.div>
      </div>

      {/* Custom Styles */}
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
        
        @keyframes wave-services-animation {
          0% { transform: translateY(0); }
          50% { transform: translateY(15px); }
          100% { transform: translateY(0); }
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

        .wave-services-1-top,
        .wave-services-1-bottom {
          animation: wave-services-animation 12s infinite ease-in-out;
        }

        .wave-services-2-top,
        .wave-services-2-bottom {
          animation: wave-services-animation 16s infinite ease-in-out reverse;
        }
      `}</style>
    </section>
  )
}
