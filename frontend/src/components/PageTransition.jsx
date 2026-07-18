import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export function PageTransition({ children }) {
  const containerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [location.pathname]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
