import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  // Default to 'nl' as the initial language
  const defaultLocale = 'nl'
  
  return (
    <Html>
      <Head>
        
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
