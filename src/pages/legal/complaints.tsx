import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import { MessageCircle, Clock, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

const ComplaintsProcedure: NextPage = () => {
  const { t } = useTranslation('common')



  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-8">{t('legal.complaints.title')}</h1>
          
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.complaints.introduction.title')}</h2>
                  <p className="text-gray-600">{t('legal.complaints.introduction.description')}</p>
                </div>
              </div>
            </section>

            {/* How to File a Complaint */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.complaints.howToFile.title')}</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">{t('legal.complaints.howToFile.description')}</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Link 
                        href="/contact" 
                        className="text-primary hover:text-primary/80 font-medium flex items-center gap-2"
                      >
                        <Mail className="w-5 h-5" />
                        {t('legal.complaints.contactUs')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Response Time */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.complaints.responseTime.title')}</h2>
                  <div className="space-y-2">
                    <p className="text-gray-600">{t('legal.complaints.responseTime.description')}</p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-2">
                      <li>{t('legal.complaints.responseTime.initial')}</li>
                      <li>{t('legal.complaints.responseTime.investigation')}</li>
                      <li>{t('legal.complaints.responseTime.resolution')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Important Notice */}
            <section>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('legal.complaints.importantNotice.title')}</h2>
                  <p className="text-gray-600">{t('legal.complaints.importantNotice.description')}</p>
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
                  <h2 className="text-xl font-semibold mb-3">{t('legal.complaints.contact.title')}</h2>
                  <div className="space-y-2 text-gray-600">
                    <p>{t('legal.complaints.contact.description')}</p>
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

export default ComplaintsProcedure