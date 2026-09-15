import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';

export function Header() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    // sticky (e nao fixed): ocupa o proprio espaco no fluxo, entao o main nao
    // precisa mais compensar com padding. Fundo solido porque o conteudo ainda
    // passa por baixo quando ele gruda no topo.
    <header className="sticky top-0 z-[100] flex items-center justify-between px-[5vw] py-5 bg-void border-b border-line">
      <div className="logo flex items-center gap-2.5">
        <picture>
          <source srcSet="/assets/logo.webp" type="image/webp" />
          <img
            className="h-[34px] w-auto block animate-logo-sway [transform-origin:50%_60%]"
            src="/assets/logo.png"
            alt="BECKHAM"
            width={120}
            height={34}
            loading="eager"
          />
        </picture>
      </div>

      <button
        className="hidden max-[760px]:block bg-none border border-line text-ink text-[1.3rem] leading-none px-3 py-1.5 cursor-pointer"
        aria-label="Abrir menu"
        onClick={() => setNavOpen((v) => !v)}
      >
        ☰
      </button>

      <nav
        className={cn(
          'flex gap-1.5',
          'max-[760px]:absolute max-[760px]:top-full max-[760px]:left-0 max-[760px]:right-0',
          'max-[760px]:flex-col max-[760px]:gap-0 max-[760px]:bg-panel max-[760px]:border-b max-[760px]:border-line max-[760px]:px-[5vw] max-[760px]:pb-4 max-[760px]:pt-2',
          navOpen ? 'max-[760px]:flex' : 'max-[760px]:hidden',
        )}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            onClick={() => setNavOpen(false)}
            className={({ isActive }) =>
              cn(
                'clip-corner-sm max-[760px]:[clip-path:none] bg-none border border-transparent text-ink-dim text-[0.85rem] font-bold tracking-wide px-[18px] py-[9px] cursor-pointer transition-colors',
                'max-[760px]:px-2 max-[760px]:py-3 max-[760px]:text-left',
                'hover:text-ink',
                isActive && 'text-ink bg-brand/[0.08] border-line',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
