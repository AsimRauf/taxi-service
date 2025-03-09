import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import Layout from '@/components/Layout'
import { Suspense, useEffect, useRef } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { EditProvider } from '@/contexts/EditContext'
import { DefaultSeo } from 'next-seo'

const seoConfig = {
  title: "TaxiRitje - Professionele Taxiservice Nederland",
  description: "Boek betrouwbare taxidiensten in heel Nederland. Luchthaventransfers, zakelijk vervoer & meer. Vaste prijzen, 24/7 service.",
  canonical: "https://taxiritje.nl",
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://taxiritje.nl',
    siteName: 'TaxiRitje',
    images: [{
      url: '/images/Logo.png',
      width: 800,
      height: 600,
      alt: 'TaxiRitje Nederland',
    }],
  },
  additionalLinkTags: [{
    rel: 'alternate',
    hrefLang: 'nl',
    href: 'https://taxiritje.nl'
  }]
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
