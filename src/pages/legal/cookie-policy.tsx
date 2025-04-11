import { GetStaticProps, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'

const CookiePolicy: NextPage = () => {
  const { t } = useTranslation('common')

  // Safely handle the cookie types array
  const cookieTypes = t('legal.cookiePolicy.howWeUse.types', { returnObjects: true })
  const cookieTypesList = Array.isArray(cookieTypes) ? cookieTypes : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-8">{t('legal.cookiePolicy.title')}</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.cookiePolicy.whatAreCookies.title')}</h2>
              <p className="text-gray-600">{t('legal.cookiePolicy.whatAreCookies.description')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.cookiePolicy.howWeUse.title')}</h2>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                {cookieTypesList.map((type, index) => (
                  <li key={index}>{type}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.cookiePolicy.yourChoices.title')}</h2>
              <p className="text-gray-600">{t('legal.cookiePolicy.yourChoices.description')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t('legal.cookiePolicy.contact.title')}</h2>
              <div className="text-gray-600">
                <p>{t('legal.cookiePolicy.contact.description')}</p>
                <p className="mt-2">Email: info@taxiritje.nl</p>
                <p>Phone: 010-843 77 62</p>
                <p>Address: Dwerggras 30, 3068PC Rotterdam</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p>BTW: NL814157932B01</p>
                  <p>KVK: 24369978</p>
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

export default CookiePolicy