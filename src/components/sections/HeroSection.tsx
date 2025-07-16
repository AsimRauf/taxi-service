import { BookingForm } from '../forms/BookingForm'
import CarAnimation from '../ui/CarAnimation'
import { WebsiteTranslations } from '@/types/translations'
import { Phone, Star, Zap, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  translations: WebsiteTranslations
}

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Animated gradient orbs */}
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
    
    {/* Floating particles */}
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      ></div>
    ))}
  </div>
)

const HeroFeatures = ({ translations }: { translations: WebsiteTranslations }) => {
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
    <div className="hidden md:block bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90 backdrop-blur-sm border-t border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      <div className="w-[90%] md:max-w-4xl mx-auto py-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 group hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className={`rounded-full ${feature.color} p-2 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white group-hover:text-secondary transition-colors duration-300">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  const titleWords = translations.hero.title.split(' ');
  const titleFirstPart = titleWords.slice(0, -2).join(' ');
  const titleSecondPart = titleWords.slice(-2).join(' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 pt-32 pb-16 lg:pb-0 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main content */}
      <div className="w-[90%] md:max-w-7xl mt-6 lg:mt-10 mx-auto relative z-10 lg:flex lg:items-center lg:gap-16">
        <div className="lg:w-1/2 text-center lg:text-left text-white mb-12 lg:mb-0">
          {/* Animated title */}
          <h1 className={`mt-8 text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight tracking-tight px-2 xs:px-4 transition-all duration-1000 ${isLoaded ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent animate-shimmer">
              {titleFirstPart}
            </span>
            <br className="md:hidden" />
            <span className="inline-block bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent animate-shimmer">
              {' '}{titleSecondPart}
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
        
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
        }
        
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
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
