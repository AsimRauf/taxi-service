import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import Layout from '@/components/Layout'
import { Suspense } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'


function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback="loading">
      <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      </AuthProvider>
    </Suspense>
  )
}

export default appWithTranslation(App)
