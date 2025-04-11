import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Car,
  Phone 
} from 'lucide-react'

const TermsAndConditions: NextPage = () => {
  const { t } = useTranslation('common')

  // Safely handle arrays from translations
  const getTranslationArray = (path: string): string[] => {
    const items = t(path, { returnObjects: true })
    return Array.isArray(items) ? items.map(String) : []
  }

  // Get translation arrays
  const generalTermsItems = getTranslationArray('legal.termsConditions.generalTerms.items')
  const bookingTermsItems = getTranslationArray('legal.termsConditions.bookingTerms.items')
  const paymentTermsItems = getTranslationArray('legal.termsConditions.paymentTerms.items')
  const liabilityItems = getTranslationArray('legal.termsConditions.liability.items')

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-8">{t('legal.termsConditions.title')}</h1>
          
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.termsConditions.introduction.title')}</h2>
                  <p className="text-gray-600">{t('legal.termsConditions.introduction.description')}</p>
                </div>
              </div>
            </section>

            {/* General Terms */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.termsConditions.generalTerms.title')}</h2>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2">
                    {generalTermsItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Booking Terms */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.termsConditions.bookingTerms.title')}</h2>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2">
                    {bookingTermsItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.termsConditions.paymentTerms.title')}</h2>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2">
                    {paymentTermsItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Liability */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.termsConditions.liability.title')}</h2>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2">
                    {liabilityItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.termsConditions.contact.title')}</h2>
                  <div className="space-y-2 text-gray-600">
                    <p>{t('legal.termsConditions.contact.description')}</p>
                    <p>Email: info@taxiritje.nl</p>
                    <p>Tel: 010-843 77 62</p>
                    <p>Dwerggras 30, 3068PC Rotterdam</p>
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <p>BTW: NL814157932B01</p>
                      <p>KVK: 24369978</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
    },
  }
}

export default TermsAndConditions