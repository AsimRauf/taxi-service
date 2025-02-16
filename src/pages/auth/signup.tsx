
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SignUpForm } from '@/components/forms/SignUpForm'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'nl', ['common'])),
    },
  }
}

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <SignUpForm />
    </div>
  )
}
