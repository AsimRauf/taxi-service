module.exports = {
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'en'],
    localeDetection: false, // Disable locale detection
  },
  defaultNS: 'common',
  localePath: './public/locales',
  react: {
    useSuspense: false // Add this for better language switching
  }
}
