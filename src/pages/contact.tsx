import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  FileText,
  MessageCircle,
  Headphones,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

interface FormData {
  bookingNumber?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

const Contact: NextPage = () => {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<FormData>({
    bookingNumber: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Something went wrong')

      setSubmitted(true)
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        subject: '',
        message: '',
        bookingNumber: ''
      })
    } catch (error) {
      setError(t('contact.errors.submitFailed'))
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: t('contact.phone'),
      content: "010-843 77 62",
      description: t('contact.phoneDescription')
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t('contact.email'),
      content: "info@taxiritje.nl",
      description: t('contact.emailDescription')
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t('contact.address'),
      content: "Dwerggras 30, 3068PC Rotterdam",
      description: t('contact.addressDescription')
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t('contact.companyInfo'),
      content: "BTW: NL814157932B01 | KVK: 24369978",
      description: t('contact.companyDescription')
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t('contact.hours'),
      content: t('contact.available247'),
      description: t('contact.hoursDescription')
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: t('contact.support'),
      content: t('contact.customerSupport'),
      description: t('contact.supportDescription')
    }
  ]

  return (
    <>
      <Head>
        <title>{t('seo.contact.title')}</title>
        <meta name="description" content={t('seo.contact.description')} />
      </Head>
      
      <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white min-h-screen pt-32 pb-16 overflow-hidden">
        {/* Background Elements */}
        <AnimatedBackground />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-block px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-full text-sm font-semibold tracking-wide uppercase border border-white/20 shadow-lg mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              {t('contact.getInTouch')}
            </motion.span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </motion.div>

          {/* Contact Info Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                  <div className="text-white">
                    {info.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {info.title}
                </h3>
                <p className="text-white/90 font-medium mb-1">
                  {info.content}
                </p>
                <p className="text-white/70 text-sm">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {t('contact.sendMessage')}
                </h2>
                <p className="text-white/80">
                  {t('contact.formDescription')}
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {t('contact.thankYou')}
                  </h3>
                  <p className="text-white/80 text-lg">
                    {t('contact.responseMessage')}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <label htmlFor="fullName" className="block text-white font-medium mb-2">
                        {t('contact.fullName')}
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder={t('contact.fullNamePlaceholder')}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <label htmlFor="email" className="block text-white font-medium mb-2">
                        {t('contact.email')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder={t('contact.emailPlaceholder')}
                      />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <label htmlFor="phoneNumber" className="block text-white font-medium mb-2">
                        {t('contact.phone')}
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder={t('contact.phonePlaceholder')}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <label htmlFor="bookingNumber" className="block text-white font-medium mb-2">
                        {t('contact.bookingNumber')}
                      </label>
                      <input
                        type="text"
                        id="bookingNumber"
                        name="bookingNumber"
                        value={formData.bookingNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder={t('contact.bookingNumberPlaceholder')}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <label htmlFor="subject" className="block text-white font-medium mb-2">
                      {t('contact.subject')}
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={handleSubjectChange}
                      required
                    >
                      <SelectTrigger className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all h-auto">
                        <SelectValue placeholder={t('contact.selectSubject')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="booking">{t('contact.subjects.booking')}</SelectItem>
                        <SelectItem value="support">{t('contact.subjects.support')}</SelectItem>
                        <SelectItem value="feedback">{t('contact.subjects.feedback')}</SelectItem>
                        <SelectItem value="complaint">{t('contact.subjects.complaint')}</SelectItem>
                        <SelectItem value="other">{t('contact.subjects.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <label htmlFor="message" className="block text-white font-medium mb-2">
                      {t('contact.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                      placeholder={t('contact.messagePlaceholder')}
                    />
                  </motion.div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-500/20 border border-red-500/30 rounded-xl p-4"
                    >
                      <p className="text-red-200 text-center">{error}</p>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 bg-white text-primary py-4 px-8 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all disabled:bg-white/50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        {t('contact.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        {t('contact.send')}
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
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

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }

        .wave-top,
        .wave-bottom {
          animation: wave-animation 12s infinite ease-in-out;
        }

        @keyframes wave-animation {
          0% { transform: translateY(0); }
          50% { transform: translateY(15px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}

export default Contact
