import { BookingForm } from '../forms/BookingForm'
import { WebsiteTranslations } from '@/types/translations'

interface HeroSectionProps {
  translations: WebsiteTranslations
}

export const HeroSection = ({ translations }: HeroSectionProps) => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary-dark pt-24 pb-16">
        <div className="w-[90%] md:max-w-4xl mt-6 lg:mt-10 mx-auto">
          <div className="text-center text-white mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-2 leading-tight tracking-tight px-4">
              <span className="inline-block">{translations.hero.title.split(' ').slice(0, 2).join(' ')}</span>
              <br className="hidden sm:block"/>
              <span className="inline-block">{translations.hero.title.split(' ').slice(2).join(' ')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 font-light max-w-2xl mx-auto px-4">
              {translations.hero.subtitle}
            </p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
            <BookingForm />
          </div>
        </div>
      </div>
    )
}
