import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Book, Server, Phone } from 'lucide-react'

const PrivacyPolicy: NextPage = () => {
  const { t } = useTranslation('common')

  // Safely handle arrays from translations with proper typing
  const getTranslationArray = (path: string): string[] => {
    const items = t(path, { returnObjects: true })
    if (Array.isArray(items)) {
      return items.map(item => String(item))
    }
    return []
  }

  // Get translation arrays
  const dataCollectionItems = getTranslationArray('legal.privacyPolicy.dataCollection.items')
  const dataUsageItems = getTranslationArray('legal.privacyPolicy.dataUsage.items')
  const yourRightsItems = getTranslationArray('legal.privacyPolicy.yourRights.items')

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-8">{t('legal.privacyPolicy.title')}</h1>
          
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.privacyPolicy.introduction.title')}</h2>
                  <p className="text-gray-600">{t('legal.privacyPolicy.introduction.description')}</p>
                </div>
              </div>
            </section>

            {/* Data Collection */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.privacyPolicy.dataCollection.title')}</h2>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2">
                    {dataCollectionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.privacyPolicy.dataUsage.title')}</h2>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2">
                    {dataUsageItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.privacyPolicy.dataProtection.title')}</h2>
                  <p className="text-gray-600">{t('legal.privacyPolicy.dataProtection.description')}</p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.privacyPolicy.yourRights.title')}</h2>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2">
                    {yourRightsItems.map((item, index) => (
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
                  <h2 className="text-xl font-semibold mb-3">{t('legal.privacyPolicy.contact.title')}</h2>
                  <div className="space-y-2 text-gray-600">
                    <p>{t('legal.privacyPolicy.contact.description')}</p>
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

export default PrivacyPolicy