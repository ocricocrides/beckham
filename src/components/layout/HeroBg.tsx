import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Picks a new random drift target every few seconds and eases toward it, so the glow wanders instead of looping a fixed path. */
function useDrift() {
  const [style, setStyle] = useState({ transform: 'translate(0, 0) scale(1)', transitionDuration: '6s' });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function driftToNewTarget() {
      const tx = randomBetween(-38, 38);
      const ty = randomBetween(-35, 55);
      const scale = randomBetween(0.8, 1.25);
      const duration = randomBetween(5, 9);
      setStyle({ transform: `translate(${tx}vw, ${ty}vh) scale(${scale})`, transitionDuration: `${duration}s` });
      timeoutId = setTimeout(driftToNewTarget, duration * 1000);
    }

    timeoutId = setTimeout(driftToNewTarget, randomBetween(200, 1500));
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
        className="absolute w-[520px] h-[520px] -top-40 -right-[120px] opacity-35 blur-[40px] transition-transform ease-in-out"
        style={{ background: 'linear-gradient(135deg, #7a0012, transparent 70%)', ...drift1 }}
      />
      <div
        className="absolute w-[360px] h-[360px] -bottom-36 -left-[100px] opacity-35 blur-[40px] transition-transform ease-in-out"
        style={{ background: 'radial-gradient(circle, #7a0012, transparent 70%)', ...drift2 }}
      />
    </div>
  );
}
