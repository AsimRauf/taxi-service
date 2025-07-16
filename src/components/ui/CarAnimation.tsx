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


  useLayoutEffect(() => {
    const updatePath = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          const r = 24; // Corresponds to rounded-3xl
          const newPathD = `M ${r},0 L ${width - r},0 A ${r},${r} 0 0 1 ${width},${r} L ${width},${height - r} A ${r},${r} 0 0 1 ${width - r},${height} L ${r},${height} A ${r},${r} 0 0 1 0,${height - r} L 0,${r} A ${r},${r} 0 0 1 ${r},0 Z`;
          setPathD(newPathD);
        }
      }
    };

    updatePath();

    const resizeObserver = new ResizeObserver(updatePath);
    const container = containerRef.current;
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  useEffect(() => {
    const car = carRef.current;
    const path = pathRef.current;

    if (car && path && pathD) {
      // Kill previous timeline if it exists
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const tl = gsap.timeline({ repeat: -1 });
      timelineRef.current = tl;

      tl.to(car, {
        duration: 10,
        ease: 'none',
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
        },
      });

      const wheels = gsap.utils.toArray('.wheel', car);
      gsap.to(wheels, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%',
      });

      return () => {
        tl.kill();
        gsap.killTweensOf(wheels);
        timelineRef.current = null;
      }
    }
  }, [pathD]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
      >
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
        />
      </svg>
      <div ref={carRef} className="absolute" style={{ width: '50px', height: '25px' }}>
        <svg viewBox="0 0 100 50">
          <g>
            <path d="M95,35 H5 C2.2,35 0,32.8 0,30 V20 C0,17.2 2.2,15 5,15 H20 L30,5 H70 L80,15 H95 C97.8,15 100,17.2 100,20 V30 C100,32.8 97.8,35 95,35 Z" fill="#FFC107" />
            <circle className="wheel" cx="25" cy="35" r="10" fill="#333" />
            <circle className="wheel" cx="75" cy="35" r="10" fill="#333" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default CarAnimation;
