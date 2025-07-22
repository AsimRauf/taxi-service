import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

const CarAnimation = () => {
  const carRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pathD, setPathD] = useState('');
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  
  // Simplified gate tracking
  const gateStateRef = useRef({
    isOpen: false,
    lastActionTime: 0
  });

  useLayoutEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let animationFrameId: number | null = null;

    const updatePath = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const { width, height } = containerRect;
        const calculateButton = document.getElementById('calculate-button');

        if (width > 0 && height > 0 && calculateButton) {
          const buttonRect = calculateButton.getBoundingClientRect();
          
          const buttonX = buttonRect.left - containerRect.left;
          const buttonY = buttonRect.top - containerRect.top;
          const buttonW = buttonRect.width;
          const buttonH = buttonRect.height;

          const outset = 4;
          const inset = 8;
          const insetButtonX = buttonX + inset;
          const insetButtonY = buttonY + inset;
          const insetButtonW = buttonW - (inset * 2);
          const insetButtonH = buttonH - (inset * 2);

          const r = 24 + outset;
          const br = insetButtonH / 2;

          const p = {
            bottomLeft: { x: insetButtonX, y: insetButtonY + insetButtonH },
            bottomRight: { x: insetButtonX + insetButtonW, y: insetButtonY + insetButtonH },
            topRight: { x: insetButtonX + insetButtonW, y: insetButtonY },
            topLeft: { x: insetButtonX, y: insetButtonY },
          };

          const detourStartX = insetButtonX + insetButtonW / 2;

          const newPathD = `
            M ${r},-${outset}
            L ${width - r},-${outset} A ${r},${r} 0 0 1 ${width + outset},${r}
            L ${width + outset},${height - r} A ${r},${r} 0 0 1 ${width - r},${height + outset}
            L ${detourStartX}, ${height + outset}
            L ${detourStartX}, ${p.bottomRight.y}
            L ${p.bottomRight.x - br}, ${p.bottomRight.y}
            A ${br},${br} 0 0 0 ${p.bottomRight.x}, ${p.bottomRight.y - br}
            L ${p.topRight.x}, ${p.topRight.y + br}
            A ${br},${br} 0 0 0 ${p.topRight.x - br}, ${p.topRight.y}
            L ${p.topLeft.x + br}, ${p.topLeft.y}
            A ${br},${br} 0 0 0 ${p.topLeft.x}, ${p.topLeft.y + br}
            L ${p.bottomLeft.x}, ${p.bottomLeft.y - br}
            A ${br},${br} 0 0 0 ${p.bottomLeft.x + br}, ${p.bottomLeft.y}
            L ${detourStartX}, ${p.bottomLeft.y}
            L ${detourStartX}, ${height + outset}
            L ${r},${height + outset}
            A ${r},${r} 0 0 1 -${outset},${height - r}
            L -${outset},${r}
            A ${r},${r} 0 0 1 ${r},-${outset} Z
          `.replace(/\s+/g, ' ').trim();
          
          setPathD(newPathD);
        } else if (width > 0 && height > 0) {
          const r = 24;
          const fallbackPathD = `M ${r},0 L ${width - r},0 A ${r},${r} 0 0 1 ${width},${r} L ${width},${height - r} A ${r},${r} 0 0 1 ${width - r},${height} L ${r},${height} A ${r},${r} 0 0 1 0,${height - r} L 0,${r} A ${r},${r} 0 0 1 ${r},0 Z`;
          setPathD(fallbackPathD);
        }
      });
    };

    const container = containerRef.current;
    if (!container) return;

    resizeObserver = new ResizeObserver(updatePath);
    resizeObserver.observe(container);

    mutationObserver = new MutationObserver(() => {
      if (document.getElementById('calculate-button')) {
        updatePath();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial check
    updatePath();

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const car = carRef.current;
    const path = pathRef.current;

    if (car && path && pathD) {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const tl = gsap.timeline({ 
        repeat: -1,
        onRepeat: () => {
          // Reset gate state on each loop
          gateStateRef.current = {
            isOpen: false,
            lastActionTime: 0
          };
        }
      });
      timelineRef.current = tl;

      tl.to(car, {
        duration: 15,
        ease: 'none',
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
        },
        onUpdate: function() {
          const progress = this.progress();
          const currentTime = Date.now();
          
          // Get car's current position
          const carElement = carRef.current;
          if (!carElement || !containerRef.current) return;
          
          const carRect = carElement.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const calculateButton = document.getElementById('calculate-button');
          
          if (!calculateButton) return;
          
          const buttonRect = calculateButton.getBoundingClientRect();
          
          // Calculate car position relative to container
          const carX = carRect.left - containerRect.left + carRect.width / 2;
          const carY = carRect.top - containerRect.top + carRect.height / 2;
          
          // Calculate button position and boundaries
          const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
          const buttonCenterY = buttonRect.top - containerRect.top + buttonRect.height / 2;
          const buttonTop = buttonRect.top - containerRect.top;
          const buttonBottom = buttonRect.bottom - containerRect.top;
          
          // Calculate bottom border Y position
          const bottomBorderY = containerRect.height;
          
          // Prevent rapid gate actions (minimum 1 second between actions)
          const timeSinceLastAction = currentTime - gateStateRef.current.lastActionTime;
          if (timeSinceLastAction < 1000) return;
          
          // Gate opening logic: Car approaching bottom border near button
          if (!gateStateRef.current.isOpen && 
              Math.abs(carX - buttonCenterX) < 80 && 
              carY >= bottomBorderY - 100 && 
              carY <= bottomBorderY - 20) {
            
            console.log('🚪 Opening gate - Car approaching bottom border at progress:', progress.toFixed(3));
            gateStateRef.current.isOpen = true;
            gateStateRef.current.lastActionTime = currentTime;
            
            window.dispatchEvent(new CustomEvent('carReachingBottomGate', { 
              detail: { opening: true, direction: "inward" } 
            }));
            
            // Keep gate open for 1 second, then close
            setTimeout(() => {
              if (gateStateRef.current.isOpen) {
                console.log('🚪❌ Closing gate - Timer expired');
                gateStateRef.current.isOpen = false;
                gateStateRef.current.lastActionTime = Date.now();
                
                window.dispatchEvent(new CustomEvent('carReachingBottomGate', { 
                  detail: { opening: false } 
                }));
              }
            }, 1000);
          }
          
          // Gate opening logic: Car leaving button area, heading back to bottom border
          if (!gateStateRef.current.isOpen && 
              Math.abs(carX - buttonCenterX) < 80 && 
              carY >= buttonCenterY + 50 && 
              progress > 0.6) {
            
            console.log('🚪 Opening gate - Car leaving button area at progress:', progress.toFixed(3));
            gateStateRef.current.isOpen = true;
            gateStateRef.current.lastActionTime = currentTime;
            
            window.dispatchEvent(new CustomEvent('carReachingBottomGate', { 
              detail: { opening: true, direction: "inward" } 
            }));
            
            // Keep gate open for 1 second, then close
            setTimeout(() => {
              if (gateStateRef.current.isOpen) {
                console.log('🚪❌ Closing gate - Timer expired');
                gateStateRef.current.isOpen = false;
                gateStateRef.current.lastActionTime = Date.now();
                
                window.dispatchEvent(new CustomEvent('carReachingBottomGate', { 
                  detail: { opening: false } 
                }));
              }
            }, 1000);
          }
        }
      });

      const wheels = gsap.utils.toArray('.wheel', car);
      gsap.to(wheels, {
        rotation: 360,
        duration: 0.2,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%',
      });

      const spokes = gsap.utils.toArray('.wheel-spokes', car);
      gsap.to(spokes, {
        rotation: -360,
        duration: 0.15,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%',
      });

      return () => {
        tl.kill();
        gsap.killTweensOf(wheels);
        gsap.killTweensOf(spokes);
        timelineRef.current = null;
      }
    }
  }, [pathD]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-20">
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="taxiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>
          <radialGradient id="wheelGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#444" />
            <stop offset="70%" stopColor="#222" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
        </defs>
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
        />
      </svg>
      <div ref={carRef} className="absolute" style={{ width: '50px', height: '25px' }}>
        <svg viewBox="0 0 100 50">
          <g>
            {/* Car shadow */}
            <ellipse cx="50" cy="45" rx="40" ry="5" fill="#000000" opacity="0.2" />
            
            {/* Main car body with gradient */}
            <path d="M95,35 H5 C2.2,35 0,32.8 0,30 V20 C0,17.2 2.2,15 5,15 H20 L30,5 H70 L80,15 H95 C97.8,15 100,17.2 100,20 V30 C100,32.8 97.8,35 95,35 Z" fill="url(#taxiGradient)" stroke="#E65100" strokeWidth="0.5" />
            
            {/* Car roof */}
            <path d="M25,15 L32,8 H68 L75,15 Z" fill="#FFE082" stroke="#E65100" strokeWidth="0.3" />
            
            {/* Windows */}
            <path d="M28,13 L34,10 H66 L72,13 Z" fill="#87CEEB" opacity="0.7" stroke="#0277BD" strokeWidth="0.3" />
            
            {/* Window divider */}
            <line x1="50" y1="10" x2="50" y2="13" stroke="#0277BD" strokeWidth="0.4" />
            
            {/* Door lines */}
            <line x1="25" y1="15" x2="25" y2="30" stroke="#E65100" strokeWidth="0.4" />
            <line x1="50" y1="15" x2="50" y2="30" stroke="#E65100" strokeWidth="0.4" />
            <line x1="75" y1="15" x2="75" y2="30" stroke="#E65100" strokeWidth="0.4" />
            
            {/* Door handles */}
            <circle cx="35" cy="22" r="1" fill="#C0C0C0" />
            <circle cx="65" cy="22" r="1" fill="#C0C0C0" />
            
            {/* Headlights */}
            <circle cx="95" cy="25" r="3" fill="#FFFFFF" opacity="0.9" />
            <circle cx="95" cy="25" r="2" fill="#FFFFCC" />
            
            {/* Taillights */}
            <circle cx="5" cy="25" r="2" fill="#FF4444" opacity="0.8" />
            
            {/* Taxi sign */}
            <rect x="42" y="3" width="16" height="4" fill="#000000" rx="0.5" />
            <text x="50" y="6" textAnchor="middle" fill="#FFFF00" fontSize="2.5" fontWeight="bold">TAXI</text>
            
            {/* License plate */}
            <rect x="40" y="37" width="20" height="4" fill="#FFFFFF" stroke="#000000" strokeWidth="0.2" rx="0.5" />
            <text x="50" y="40" textAnchor="middle" fill="#000000" fontSize="2" fontWeight="bold">NL-123-AB</text>
            
            {/* Enhanced front wheel */}
            <g className="wheel" style={{ transformOrigin: '25px 35px' }}>
              <circle cx="25" cy="35" r="10" fill="url(#wheelGradient)" />
              <circle cx="25" cy="35" r="7" fill="#1A1A1A" />
              <g className="wheel-spokes" style={{ transformOrigin: '25px 35px' }}>
                <line x1="25" y1="28" x2="25" y2="42" stroke="#555" strokeWidth="1" />
                <line x1="18" y1="35" x2="32" y2="35" stroke="#555" strokeWidth="1" />
                <line x1="20" y1="29" x2="30" y2="41" stroke="#555" strokeWidth="1" />
                <line x1="30" y1="29" x2="20" y2="41" stroke="#555" strokeWidth="1" />
              </g>
              <circle cx="25" cy="35" r="3" fill="#666" />
            </g>
            
            {/* Enhanced rear wheel */}
            <g className="wheel" style={{ transformOrigin: '75px 35px' }}>
              <circle cx="75" cy="35" r="10" fill="url(#wheelGradient)" />
              <circle cx="75" cy="35" r="7" fill="#1A1A1A" />
              <g className="wheel-spokes" style={{ transformOrigin: '75px 35px' }}>
                <line x1="75" y1="28" x2="75" y2="42" stroke="#555" strokeWidth="1" />
                <line x1="68" y1="35" x2="82" y2="35" stroke="#555" strokeWidth="1" />
                <line x1="70" y1="29" x2="80" y2="41" stroke="#555" strokeWidth="1" />
                <line x1="80" y1="29" x2="70" y2="41" stroke="#555" strokeWidth="1" />
              </g>
              <circle cx="75" cy="35" r="3" fill="#666" />
            </g>
            
            {/* Side mirror */}
            <ellipse cx="12" cy="20" rx="1.5" ry="1" fill="#C0C0C0" />
            
            {/* Antenna */}
            <line x1="55" y1="3" x2="55" y2="0" stroke="#333" strokeWidth="0.5" />
            <circle cx="55" cy="0" r="0.4" fill="#333" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default CarAnimation;