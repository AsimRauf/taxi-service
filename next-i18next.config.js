module.exports = {
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'en'],
    localeDetection: false, // Keep false for better control
  },
  defaultNS: 'common',
  localePath: './public/locales',
  react: {
    useSuspense: false // Add this for better language switching
  }
}
