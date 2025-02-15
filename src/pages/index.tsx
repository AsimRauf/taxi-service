import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
    },
  }
}

export default function Home() {
  const { t } = useTranslation('common')

  return (
    <main className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-secondary">
          {t('hero.title')}
        </h1>
        {/* Rest of your content */}
      </div>
    </main>
  )
}
