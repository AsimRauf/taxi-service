import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import Layout from '@/components/Layout'
import { Suspense, useEffect, useRef } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { EditProvider } from '@/contexts/EditContext'
import { DefaultSeo } from 'next-seo'

const seoConfig = {
  title: "TaxiRitje - Professionele Taxiservice Nederland | 24/7 Beschikbaar",
  description: "✓ 24/7 Taxi Service ✓ Vaste Prijzen ✓ Luchthavenvervoer ✓ Directe Boeking. Betrouwbaar taxivervoer in heel Nederland met vooraf bekend tarief.",
  canonical: "https://taxiritje.nl",
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://taxiritje.nl',
    siteName: 'TaxiRitje',
    title: "TaxiRitje - Professionele Taxiservice Nederland | 24/7 Beschikbaar",
    description: "✓ 24/7 Taxi Service ✓ Vaste Prijzen ✓ Luchthavenvervoer ✓ Directe Boeking. Betrouwbaar taxivervoer in heel Nederland met vooraf bekend tarief.",
    images: [{
      url: '/images/Logo.png',
      width: 800,
      height: 600,
      alt: 'TaxiRitje - Professionele Taxiservice Nederland'
    }]
  },
  twitter: {
    cardType: 'summary_large_image',
    handle: '@taxiritje',
    site: '@taxiritje'
  },
  additionalMetaTags: [{
    name: 'keywords',
    content: 'taxi, taxiritje, taxi service, airport taxi, business taxi, rotterdam taxi, amsterdam taxi, eindhoven taxi'
  }],
  additionalLinkTags: [
    {
      rel: 'alternate',
      hrefLang: 'nl',
      href: 'https://taxiritje.nl'
    },
    {
      rel: 'icon',
      href: '/favicon.ico',
    }, 
    {
      rel: 'apple-touch-icon',
      href: '/images/Logo.png',
      sizes: '180x180'
    }
],
  structuredData: {
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
}

declare global {
  interface Window {
    initMap: () => void;
  }
}

function App({ Component, pageProps }: AppProps) {
  const mapLoaded = useRef(false); // Prevent multiple loads

  useEffect(() => {
    if (mapLoaded.current) return; // Prevent reloading
    mapLoaded.current = true;

    window.initMap = function () {
      console.log("Google Maps Initialized");
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup script on unmount
    };
  }, []);

  return (
    <>
      <Suspense fallback="loading">
        <DefaultSeo {...seoConfig} />
        <AuthProvider>
          <EditProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </EditProvider>
        </AuthProvider>
      </Suspense>
    </>
  );
}

export default appWithTranslation(App);
