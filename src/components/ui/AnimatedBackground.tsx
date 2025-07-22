import React from 'react';

// Background Components
export const WaveBackground = ({ position }: { position: 'top' | 'bottom' }) => (
  <div
    className={`absolute left-0 w-full h-auto z-0 ${position === 'top' ? 'top-0' : 'bottom-0'}`}
    style={position === 'top' ? { transform: 'scaleY(-1)' } : {}}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
      <defs>
        <linearGradient id={`wave-gradient-${position}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.1)' }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0.05)' }} />
        </linearGradient>
      </defs>
      <path 
        className={`wave-${position}`} 
        fill={`url(#wave-gradient-${position})`} 
        fillOpacity="1" 
        d="M0,160L48,181.3C96,203,192,245,288,256C384,267,480,245,576,208C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </svg>
  </div>
)

export const FloatingShapes = () => (
  <>
    <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-float-slow"></div>
    <div className="absolute top-40 right-20 w-32 h-32 bg-white/3 rounded-full blur-2xl animate-float-medium"></div>
    <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-white/4 rounded-full blur-lg animate-float-fast"></div>
    <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-white/3 rounded-full blur-xl animate-float-slow"></div>
  </>
)

export const DotPattern = ({ top, left, right, bottom, uniqueId }: { 
  top?: string, 
  left?: string, 
  right?: string, 
  bottom?: string, 
  uniqueId: string 
}) => (
  <div
    className="absolute z-0 opacity-40"
    style={{ top, left, right, bottom, width: '200px', height: '200px' }}
  >
    <svg width="100%" height="100%">
      <defs>
        <pattern id={`dot-pattern-${uniqueId}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="rgba(255, 255, 255, 0.3)" />
        </pattern>
        <radialGradient id={`gradient-mask-${uniqueId}`}>
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect 
        width="100%" 
        height="100%" 
        fill={`url(#dot-pattern-${uniqueId})`} 
        mask={`url(#gradient-mask-${uniqueId})`} 
      />
    </svg>
  </div>
)

export const AnimatedBackground = () => (
    <>
        <WaveBackground position="top" />
        <WaveBackground position="bottom" />
        <FloatingShapes />
        <DotPattern top="10%" right="5%" uniqueId="top-right" />
        <DotPattern bottom="15%" left="8%" uniqueId="bottom-left" />
        <DotPattern top="50%" right="10%" uniqueId="middle-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 z-0"></div>
    </>
)