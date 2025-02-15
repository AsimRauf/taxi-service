import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import Layout from '@/components/Layout'
import { Suspense } from 'react'

function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback="loading">
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Suspense>
  )
}

export default appWithTranslation(App)
