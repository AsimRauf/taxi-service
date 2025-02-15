import { BookingForm } from '../forms/BookingForm'
import  {WebsiteTranslations}  from '@/types/translations'

interface HeroSectionProps {
  translations: WebsiteTranslations
}

export const HeroSection = ({ translations }: HeroSectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark pt-24 pb-16">
      <div className="w-[90%] md:max-w-3xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 leading-tight">
            {translations.hero.title.split(' ').slice(0, 2).join(' ')} <br/>
            {translations.hero.title.split(' ').slice(2).join(' ')}
          </h1>
          <p className="text-base md:text-lg text-white/90">
            {translations.hero.subtitle}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-4 md:p-6">
          <BookingForm translations={translations} />
        </div>
      </div>
    </div>
  )
}
