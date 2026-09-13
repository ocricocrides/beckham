import { useLocation } from 'react-router-dom';

export function HeroBg() {
  const isHome = useLocation().pathname === '/';

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-opacity duration-[400ms]"
      style={{ opacity: isHome ? 1 : 0.35 }}
    >
      <div
        className="absolute w-[520px] h-[520px] -top-40 -right-[120px] opacity-35 blur-[40px] animate-glow-drift-1"
        style={{ background: 'linear-gradient(135deg, #7a0012, transparent 70%)' }}
      />
      <div
        className="absolute w-[360px] h-[360px] -bottom-36 -left-[100px] opacity-35 blur-[40px] animate-glow-drift-2"
        style={{ background: 'radial-gradient(circle, #7a0012, transparent 70%)' }}
      />
    </div>
  );
}
