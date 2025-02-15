import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
    },
  }
}

export default function Home() {

  return (
    <main className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
      </div>
    </main>
  )
}
