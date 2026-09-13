import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * Picks a new random drift target every couple seconds and eases toward it, so the glow
 * wanders across the whole page instead of jittering near a fixed corner. Each slab is
 * anchored at the viewport center (top-1/2 left-1/2) and translated from there, so the
 * random vw/vh range below is how far it can roam from the middle in each direction.
 */
function useDrift() {
  const [style, setStyle] = useState({ transform: 'translate(-50%, -50%)', transitionDuration: '3s' });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function driftToNewTarget() {
      const tx = randomBetween(-42, 42);
      const ty = randomBetween(-38, 38);
      const scale = randomBetween(0.8, 1.3);
      const duration = randomBetween(1.5, 3);
      setStyle({
        transform: `translate(calc(-50% + ${tx}vw), calc(-50% + ${ty}vh)) scale(${scale})`,
        transitionDuration: `${duration}s`,
      });
      timeoutId = setTimeout(driftToNewTarget, duration * 1000);
    }

    timeoutId = setTimeout(driftToNewTarget, randomBetween(200, 1000));
    return () => clearTimeout(timeoutId);
  }, []);

  return style;
}

export function HeroBg() {
  const isHome = useLocation().pathname === '/';
  const drift1 = useDrift();
  const drift2 = useDrift();

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-opacity duration-[400ms]"
      style={{ opacity: isHome ? 1 : 0.35 }}
    >
      <div
        className="absolute top-1/2 left-1/2 w-[520px] h-[520px] rounded-full opacity-35 blur-[40px] transition-transform ease-in-out"
        style={{ background: 'radial-gradient(circle, #7a0012, transparent 70%)', ...drift1 }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[360px] h-[360px] rounded-full opacity-35 blur-[40px] transition-transform ease-in-out"
        style={{ background: 'radial-gradient(circle, #7a0012, transparent 70%)', ...drift2 }}
      />
    </div>
  );
}
