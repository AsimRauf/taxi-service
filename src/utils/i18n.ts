import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    lng: 'nl',
    fallbackLng: 'nl',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
  })

export default i18n
