import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { createTranslationsObject } from '@/utils/translations'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
    },
  }
}

export default function Home() {
  const { t } = useTranslation('common')
  const translations = createTranslationsObject(t, 'nl')

  return (
    <main>
      <HeroSection translations={translations} />
      <FeaturesSection translations={translations} />
      <ServicesSection translations={translations} />
    </main>
  )
}
