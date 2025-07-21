import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { Footer } from '@/components/Footer'
import { createTranslationsObject } from '@/utils/translations'
import { useEffect, useState } from 'react'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
    },
  }
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TaxiService",
  "name": "TaxiRitje",
  "areaServed": {
    "@type": "Country",
    "name": "Nederland"
  },
  "description": "Professionele taxiservice in heel Nederland",
  "availableLanguage": ["Nederlands", "Engels"],
  "priceRange": "€€",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "NL",
    "streetAddress": "Dwerggras 30",
    "postalCode": "3068PC",
    "addressLocality": "Rotterdam"
  },
  "url": "https://taxiritje.nl",
  "telephone": "010-843 77 62",
  "email": "info@taxiritje.nl"
}

export default function Home() {
  const { t, i18n } = useTranslation('common')
  const [translations, setTranslations] = useState(() => createTranslationsObject(t, i18n.language))
  
  // Update translations when language changes
  useEffect(() => {
    setTranslations(createTranslationsObject(t, i18n.language))
  }, [i18n.language, t])

  return (
    <>
      <Head>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
      </Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <HeroSection translations={translations} />
        <FeaturesSection translations={translations} />
        <ServicesSection translations={translations} />
      </main>
      <Footer />
    </>
  )
}
