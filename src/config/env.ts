export const config = {
  isProduction: process.env.NODE_ENV === 'production',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  // These keys are only used server-side
  serverConfig: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
  }
};

// Validate environment variables
export const validateEnv = () => {
  const required = [
    'GOOGLE_MAPS_API_KEY',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Remove any exposed API keys from client-side
  if (process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('Warning: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY should be removed. Use GOOGLE_MAPS_API_KEY instead.');
  }
};

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  validateEnv();
}
