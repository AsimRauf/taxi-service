import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => (
    <div className="border-b border-white/20 last:border-0">
        <button
            onClick={onToggle}
            className="w-full py-4 px-6 flex justify-between items-center text-left hover:bg-white/10 transition-colors rounded-lg"
        >
            <span className="font-medium text-white text-sm sm:text-base">{question}</span>
            <ChevronDownIcon
                className={`w-5 h-5 text-white transition-transform ${
                    isOpen ? 'transform rotate-180' : ''
                }`}
            />
        </button>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-4"
            >
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">{answer}</p>
            </motion.div>
        )}
    </div>
)

interface FAQSectionProps {
  title: string
  items: Record<string, { question: string; answer: string }>
  expandedItems: Set<string>
  setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>
  sectionKey: string
  activeSection: string | null
  onSectionClick: (section: string) => void
}

const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  items,
  expandedItems,
  setExpandedItems,
  sectionKey,
  activeSection,
  onSectionClick
}) => {
  const isActive = activeSection === sectionKey
  
  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => onSectionClick(sectionKey)}
        className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-white/20 text-white shadow-lg'
            : 'bg-white/10 text-white hover:bg-white/15'
        }`}
      >
        <h2 className="text-lg font-semibold flex items-center justify-between">
          {title}
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isActive ? 'rotate-180' : ''}`} />
        </h2>
      </button>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2 bg-white/10 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border border-white/20"
        >
          {Object.entries(items).map(([key, item]) => (
            <FAQItem
              key={key}
              question={item.question}
              answer={item.answer}
              isOpen={expandedItems.has(key)}
              onToggle={() => {
                setExpandedItems(prev => {
                  const next = new Set(prev)
                  if (next.has(key)) {
                    next.delete(key)
                  } else {
                    next.add(key)
                  }
                  return next
                })
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

const FAQ: NextPage = () => {
  const { t } = useTranslation('common')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [activeSection, setActiveSection] = useState<string | null>('booking')

  const faqSections = [
    'booking',
    'schipholReturn',
    'additionalPickup',
    'luggage',
    'rates',
    'duringRide',
    'payment',
    'specialRequests',
    'travelingWithChildren',
    'complaints',
    'additionalServices'
  ]

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  return (
    <>
      <Head>
        <title>{t('seo.faq.title')}</title>
        <meta name="description" content={t('seo.faq.description')} />
      </Head>
      <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white min-h-screen pt-32 pb-16 overflow-hidden">
        <AnimatedBackground />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              {t('faq.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Find answers to commonly asked questions about our taxi services.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqSections.map((section) => (
              <FAQSection
                key={section}
                sectionKey={section}
                title={t(`faq.${section}.title`)}
                items={Object.keys(t(`faq.${section}`, { returnObjects: true }))
                  .filter(key => key !== 'title')
                  .reduce<FAQItems>((acc, key) => {
                    acc[key] = {
                      question: t(`faq.${section}.${key}.question`),
                      answer: t(`faq.${section}.${key}.answer`)
                    }
                    return acc
                  }, {})}
                expandedItems={expandedItems}
                setExpandedItems={setExpandedItems}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
              />
            ))}
          </div>
        </div>
      </div>
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

export default FAQ

// Add proper type for the reduce accumulator
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQItems {
  [key: string]: FAQItem;
}