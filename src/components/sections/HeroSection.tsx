import { BookingForm } from '../forms/BookingForm';
import CarAnimation from '../ui/CarAnimation';
import { WebsiteTranslations } from '@/types/translations';
import { Phone, Star, Zap, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  translations: WebsiteTranslations
}

const WaveBackground = ({ position }: { position: 'top' | 'bottom' }) => (
  <div
    className={`absolute left-0 w-full h-auto ${position === 'top' ? 'top-0' : 'bottom-0'}`}
    style={position === 'top' ? { transform: 'scaleY(-1) scaleX(-1)' } : {}}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
      <defs>
        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(0, 163, 238, 0.5)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(0, 119, 190, 0.5)' }} />
        </linearGradient>
        <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(0, 163, 238, 0.3)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(0, 119, 190, 0.3)' }} />
        </linearGradient>
      </defs>
      <path className="wave-1" fill="url(#wave-gradient)" fillOpacity="1" d="M0,160L48,181.3C96,203,192,245,288,256C384,267,480,245,576,208C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      <path className="wave-2" fill="url(#wave-gradient-2)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,192C384,203,480,245,576,256C672,267,768,245,864,213.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  </div>
);


const PhoneButton = () => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <a 
      href="tel:0850607086" 
      className={`group relative inline-flex items-center gap-3 mt-6 px-6 py-4 bg-secondary text-white font-bold text-lg xs:text-xl sm:text-2xl rounded-full shadow-2xl hover:shadow-secondary/25 transition-all duration-300 hover:scale-105`}
    >
      <Phone className={`w-6 h-6 ${isAnimating ? 'animate-ringing' : ''}`} />
      <span>085 06 07 086</span>
      <div className="absolute inset-0 rounded-full bg-secondary/50 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </a>
  )
}

const MobileFeatures = ({ translations }: { translations: WebsiteTranslations }) => {
  const features = [
    {
      icon: Shield,
      text: translations.hero.features.freeCancellation,
      color: 'bg-secondary/20'
    },
    {
      icon: Star,
      text: translations.hero.features.privateTaxi,
      color: 'bg-secondary/20'
    },
    {
      icon: Zap,
      text: translations.hero.features.freeBaggage,
      color: 'bg-secondary/20'
    }
  ]

  return (
    <div className="md:hidden mt-8 mb-8 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 animate-slide-in-left"
              style={{ animationDelay: `${1000 + index * 200}ms` }}
            >
              <div className={`rounded-full ${feature.color} p-2.5 shadow-lg`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const HeroSection = ({ translations }: HeroSectionProps) => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Split title into parts for responsive layout
  // Split title into parts for responsive layout
  const titleWords = translations.hero.title.split(' ');
  const book = titleWords[0];
  const middlePart = titleWords.slice(1, -2).join(' ');
  const lastPartPreposition = titleWords[titleWords.length - 2];
  const lastPartMain = titleWords[titleWords.length - 1];

  return (
    <div className="min-h-screen bg-primary pt-32 pb-10 lg:pb-0 relative overflow-hidden">
      <WaveBackground position="top" />
      <WaveBackground position="bottom" />
      
      {/* Main content */}
      <div className="w-[90%] md:max-w-7xl mt-6 lg:mt-10 mx-auto relative z-10 lg:flex lg:items-center lg:gap-16">
        <div className="lg:w-1/2 text-center lg:text-left text-white mb-12 lg:mb-0">
          {/* Animated title */}
          <h1 className={`mt-8 text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight tracking-tight px-2 xs:px-4 transition-all duration-1000 ${isLoaded ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-10'}`}>
            <span className="font-script text-5xl xs:text-6xl sm:text-7xl md:text-8xl">
              {book}
            </span>
            <span className="font-sans">
              {' '}{middlePart}{' '}
            </span>
            <span className="block">
              <span className="font-sans">{lastPartPreposition} </span>
              <span className="font-script text-5xl xs:text-6xl sm:text-7xl md:text-8xl">
                {lastPartMain}
              </span>
            </span>
          </h1>
          
          {/* Animated subtitle */}
          <p className={`text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto lg:mx-0 px-2 xs:px-4 leading-relaxed transition-all duration-1000 delay-300 ${isLoaded ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-10'}`}>
            {translations.hero.subtitle}
          </p>
          
          {/* Animated phone button */}
          <div className="mt-8">
            <PhoneButton />
          </div>
        </div>
        
        <div className="lg:w-1/2">
          {/* Booking form with enhanced styling */}
          <div className={`relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 ${isLoaded ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '600ms' }}>
            <CarAnimation />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl"></div>
            <div className="relative z-10 p-6 sm:p-8 md:p-10">
              <BookingForm />
            </div>
          </div>
          
          {/* Mobile features */}
          <MobileFeatures translations={translations} />
        </div>
      </div>
      
      
      {/* Add custom styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
        }

        @keyframes wave-animation {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
          100% {
            transform: translateY(0);
          }
        }

        .wave-1 {
          animation: wave-animation 10s infinite ease-in-out;
        }

        .wave-2 {
          animation: wave-animation 15s infinite ease-in-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        @keyframes ringing {
          0% { transform: rotate(0); }
          25% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
          100% { transform: rotate(0); }
        }

        .animate-ringing {
          animation: ringing 1.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
