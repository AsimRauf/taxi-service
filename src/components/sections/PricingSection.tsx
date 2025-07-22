import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { 
  MapPin, 
  Car, 
  Users, 
  Clock, 
  Star, 
  ArrowRight,
  Plane,
  Building2,
  Check,
  Zap
} from 'lucide-react'
import { fixedRoutes } from '@/data/fixedPrice'

interface PriceData {
  from: string;
  to: string;
  icon: React.ReactNode;
  stationWagon: number;
  bus: number;
  popular?: boolean;
}

const WaveBackground = ({ position }: { position: 'top' | 'bottom' }) => (
  <div
    className={`absolute left-0 w-full h-auto ${position === 'top' ? 'top-0' : 'bottom-0'}`}
    style={position === 'top' ? { transform: 'scaleY(-1)' } : {}}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
      <defs>
        <linearGradient id="pricing-wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(0, 163, 238, 0.1)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(0, 119, 190, 0.05)' }} />
        </linearGradient>
      </defs>
      <path 
        className="pricing-wave" 
        fill="url(#pricing-wave-gradient)" 
        fillOpacity="1" 
        d="M0,160L48,181.3C96,203,192,245,288,256C384,267,480,245,576,208C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </svg>
  </div>
)

const PriceCard = ({ priceData, index }: { priceData: PriceData; index: number }) => {
  const { t } = useTranslation('common')
  const [selectedVehicle, setSelectedVehicle] = useState<'stationWagon' | 'bus'>('stationWagon')

  return (
    <div
      className={`group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 ${
        priceData.popular
          ? 'bg-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border border-primary/20 ring-2 ring-taxi-yellow/50'
          : 'bg-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border border-primary/20'
      }`}
    >
      {/* Popular badge */}
      {priceData.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-taxi-yellow text-primary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
            <Star className="w-4 h-4" />
            {t('pricing.popular')}
          </div>
        </div>
      )}

      <div className="relative z-10 p-8 md:p-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
            <div className="text-primary text-2xl">
              {priceData.icon}
            </div>
          </div>
          <h3 className="text-lg font-bold text-primary mb-1">{priceData.from}</h3>
          <div className="text-sm text-gray-500 mb-2">to</div>
          <h3 className="text-lg font-bold text-primary mb-2">{priceData.to}</h3>
        </div>

        {/* Vehicle Selection */}
        <div className="mb-6">
          <div className="flex bg-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border border-primary/20 rounded-xl p-1">
            <button
              onClick={() => setSelectedVehicle('stationWagon')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedVehicle === 'stationWagon'
                  ? 'bg-primary/20 text-primary shadow-md border border-primary/20'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Car className="w-4 h-4" />
              {t('pricing.stationWagon')}
            </button>
            <button
              onClick={() => setSelectedVehicle('bus')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedVehicle === 'bus'
                  ? 'bg-primary/20 text-primary shadow-md border border-primary/20'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Users className="w-4 h-4" />
              {t('pricing.bus')}
            </button>
          </div>
        </div>

        {/* Price Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedVehicle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <div className="text-4xl font-bold text-primary mb-2">
              €{selectedVehicle === 'stationWagon' ? priceData.stationWagon : priceData.bus}
            </div>
            <div className="text-sm text-gray-600">
              {selectedVehicle === 'stationWagon' ? t('pricing.upTo4Passengers') : t('pricing.upTo8Passengers')}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Features */}
        <div className="space-y-3 mb-8 mt-auto">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Check className="w-4 h-4 text-primary" />
            <span>{t('pricing.fixedPrice')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Check className="w-4 h-4 text-primary" />
            <span>{t('pricing.freeCancellation')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Check className="w-4 h-4 text-primary" />
            <span>{t('pricing.meetAndGreet')}</span>
          </div>
        </div>

        {/* Book Now Button */}
        <button
          className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:bg-primary/90"
        >
          <span>{t('pricing.bookNow')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  )
}

export const PricingSection = () => {
  const { t } = useTranslation('common');
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      // Use 1024px as the breakpoint for showing 3 cards, matching lg:grid-cols-3
      setCardsPerPage(window.innerWidth < 1024 ? 1 : 3);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allPriceData: PriceData[] = useMemo(() => {
    const data: PriceData[] = [];
    for (const from in fixedRoutes) {
      for (const to in fixedRoutes[from]) {
        data.push({
          from: from,
          to: to,
          stationWagon: fixedRoutes[from][to].stationWagon,
          bus: fixedRoutes[from][to].bus,
          icon: from.toLowerCase().includes('airport') ? <Plane className="w-6 h-6" /> : <Building2 className="w-6 h-6" />,
          popular: (from.includes('Schiphol') && to.includes('Rotterdam')) || (from.includes('Rotterdam') && to.includes('Haarlem'))
        });
      }
    }
    return data;
  }, []);

  const pageCount = Math.ceil(allPriceData.length / cardsPerPage);

  useEffect(() => {
    if (pageCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % pageCount);
    }, 15000); // 15 seconds

    return () => clearInterval(timer);
  }, [pageCount]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(0);

  const paginate = (newPage: number) => {
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      <WaveBackground position="top" />
      <WaveBackground position="bottom" />
      
      {/* Floating background elements matching your existing design */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-[95%] md:w-[90%] max-w-7xl mx-auto relative z-10">
        {/* Section Header - matching your existing style */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wide uppercase">
              {t('pricing.fixedPrices')}
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-primary"
          >
            {t('pricing.title')}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {t('pricing.subtitle')}
          </motion.p>
        </div>

        {/* Pricing Carousel */}
        <div className="relative mb-8 pt-8 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              custom={direction}
            >
              {allPriceData
                .slice(
                  currentPage * cardsPerPage,
                  (currentPage + 1) * cardsPerPage
                )
                .map((price, index) => (
                  <PriceCard
                    key={`${price.from}-${price.to}`}
                    priceData={price}
                    index={index}
                  />
                ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot Navigation */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentPage === i ? 'bg-primary scale-125' : 'bg-primary/30 hover:bg-primary/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Additional Info - matching your existing glassmorphism style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-primary mb-2">{t('pricing.features.noHiddenFees.title')}</h3>
              <p className="text-sm text-gray-600">{t('pricing.features.noHiddenFees.description')}</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-300">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-primary mb-2">{t('pricing.features.available247.title')}</h3>
              <p className="text-sm text-gray-600">{t('pricing.features.available247.description')}</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-primary mb-2">{t('pricing.features.doorToDoor.title')}</h3>
              <p className="text-sm text-gray-600">{t('pricing.features.doorToDoor.description')}</p>
            </div>
            
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 group-hover:scale-105 transition-transform duration-300">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-primary mb-2">{t('pricing.features.professionalDrivers.title')}</h3>
              <p className="text-sm text-gray-600">{t('pricing.features.professionalDrivers.description')}</p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action - matching your existing button styles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-primary/20 shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              {t('pricing.cta.title')}
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('pricing.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:bg-primary/90"
              >
                <span>{t('pricing.cta.bookNow')}</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.a
                href="tel:0850607086"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-secondary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:bg-secondary/90"
              >
                <span>{t('pricing.cta.callNow')}</span>
                <span className="text-sm">085 06 07 086</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .pricing-wave {
          animation: gentle-wave-pricing 12s infinite ease-in-out;
        }
        
        @keyframes gentle-wave-pricing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </section>
  )
}
