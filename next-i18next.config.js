module.exports = {
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'en'],
    localeDetection: true, // Enable locale detection
  },
  defaultNS: 'common',
  localePath: './public/locales',
  react: {
    useSuspense: false // Add this for better language switching
  }
}
