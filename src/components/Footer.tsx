import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, FileText } from 'lucide-react'
import { useTranslation } from 'next-i18next'

export const Footer = () => {
  const { t } = useTranslation('common')
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/Logo.png"
              alt="TaxiRitje Logo"
              width={140}
              height={20}
              className="brightness-0 invert"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <p>Dwerggras 30, 3068PC Rotterdam</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <p>010-843 77 62</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <p>info@taxiritje.nl</p>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p>BTW: NL814157932B01</p>
                  <p>KVK: 24369978</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t('nav.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  {t('nav.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy-policy" className="hover:text-primary transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-conditions" className="hover:text-primary transition-colors">
                  {t('footer.termsConditions')}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="hover:text-primary transition-colors">
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/complaints" className="hover:text-primary transition-colors">
                  {t('footer.complaints')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Taxi Ritje. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  )
}