import { useEffect, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

// --- conversões de cor -------------------------------------------------------------------

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0,
  };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function rgbToHsv({ r, g, b }: { r: number; g: number; b: number }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 };
}

function hsvToRgb({ h, s, v }: { h: number; s: number; v: number }) {
  h /= 360;
  s /= 100;
  v /= 100;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const [r, g, b] = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ][i % 6];
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/** Luminância relativa (WCAG), pra avisar quando a cor some no fundo escuro do site. */
function luminancia(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Contraste contra o fundo dos cards (#0f1113). */
function contrasteNoPainel(hex: string) {
  const lPainel = luminancia('#0f1113');
  const l = luminancia(hex);
  const [claro, escuro] = l > lPainel ? [l, lPainel] : [lPainel, l];
  return (claro + 0.05) / (escuro + 0.05);
}

const GRADE = [
  '#ffffff', '#ebebeb', '#d6d6d6', '#c2c2c2', '#adadad', '#999999',
  '#858585', '#707070', '#5c5c5c', '#474747', '#333333', '#000000',
  '#ff1633', '#ff3b30', '#ff6b6b', '#ff9500', '#ffb340', '#ffcc00',
  '#ffe066', '#d4e157', '#a3e635', '#4cd964', '#2ecc71', '#1abc9c',
  '#00c8b3', '#5ac8fa', '#34aadc', '#3498db', '#007aff', '#4a6cf7',
  '#5856d6', '#7c5cff', '#9b59b6', '#c77dff', '#ff2d55', '#ff5e8a',
  '#7a0012', '#a11020', '#8b4513', '#b5651d', '#8a7500', '#5c6b00',
  '#1e6b3a', '#0f5257', '#0b3d91', '#2c2c54', '#4b2e5e', '#6b2737',
];

type Aba = 'Grade' | 'Espectro' | 'RGB';

// --- subcomponentes ----------------------------------------------------------------------

function Abas({ atual, onChange }: { atual: Aba; onChange: (a: Aba) => void }) {
  return (
    <div className="flex border border-line mb-3">
      {(['Grade', 'Espectro', 'RGB'] as Aba[]).map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => onChange(a)}
          className={cn(
            'flex-1 py-1.5 text-[0.75rem] font-bold tracking-wide transition-colors',
            atual === a ? 'bg-brand/[0.12] text-ink' : 'text-ink-dim hover:text-ink',
          )}
        >
          {a}
        </button>
      ))}
    </div>
  );
}

function Grade({ valor, onChange }: { valor: string; onChange: (hex: string) => void }) {
  return (
    <div className="grid grid-cols-12 gap-px bg-line p-px h-[168px]">
      {GRADE.map((cor) => (
        <button
          key={cor}
          type="button"
          aria-label={cor}
          onClick={() => onChange(cor)}
          style={{ backgroundColor: cor }}
          className="relative w-full h-full hover:z-10 hover:outline hover:outline-1 hover:outline-ink"
        >
          {valor.toLowerCase() === cor.toLowerCase() && (
            <span className="absolute inset-0 border-2 border-white mix-blend-difference" />
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Área de matiz (eixo X) por saturação (eixo Y). O brilho acompanha a saturação para que
 * o canto inferior chegue no escuro sem precisar de um controle separado.
 */
function Espectro({
  hsv,
  onChange,
}: {
  hsv: { h: number; s: number; v: number };
  onChange: (hsv: { h: number; s: number; v: number }) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const arrastando = useRef(false);

  useEffect(() => {
    function mover(e: MouseEvent | TouchEvent) {
      if (!arrastando.current || !areaRef.current) return;
      const p = 'touches' in e ? e.touches[0] : e;
      const r = areaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (p.clientX - r.left) / r.width));
      const y = Math.max(0, Math.min(1, (p.clientY - r.top) / r.height));
      onChange({ h: x * 360, s: 100, v: 100 - y * 100 });
    }
    function soltar() {
      arrastando.current = false;
    }
    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', soltar);
    window.addEventListener('touchmove', mover);
    window.addEventListener('touchend', soltar);
    return () => {
      window.removeEventListener('mousemove', mover);
      window.removeEventListener('mouseup', soltar);
      window.removeEventListener('touchmove', mover);
      window.removeEventListener('touchend', soltar);
    };
  }, [onChange]);

  function iniciar(e: React.MouseEvent) {
    arrastando.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    onChange({ h: x * 360, s: 100, v: 100 - y * 100 });
  }

  return (
    <div
      ref={areaRef}
      onMouseDown={iniciar}
      className="relative h-[168px] cursor-crosshair border border-line"
      style={{
        background: `linear-gradient(to bottom, transparent, #000 100%), linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)`,
      }}
    >
      <span
        className="absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 border-2 border-white pointer-events-none"
        style={{
          left: `${(hsv.h / 360) * 100}%`,
          top: `${100 - hsv.v}%`,
          backgroundColor: rgbToHex(hsvToRgb(hsv)),
        }}
      />
    </div>
  );
}

function CanaisRGB({
  rgb,
  onChange,
}: {
  rgb: { r: number; g: number; b: number };
  onChange: (rgb: { r: number; g: number; b: number }) => void;
}) {
  const canais: { chave: 'r' | 'g' | 'b'; rotulo: string; grad: string }[] = [
    { chave: 'r', rotulo: 'R', grad: 'linear-gradient(to right, #000, #f00)' },
    { chave: 'g', rotulo: 'G', grad: 'linear-gradient(to right, #000, #0f0)' },
    { chave: 'b', rotulo: 'B', grad: 'linear-gradient(to right, #000, #00f)' },
  ];
  return (
    <div className="h-[168px] flex flex-col justify-center gap-4">
      {canais.map(({ chave, rotulo, grad }) => (
        <div key={chave} className="flex items-center gap-2.5">
          <span className="w-4 shrink-0 text-[0.75rem] font-bold text-ink-dim">{rotulo}</span>
          <div className="flex-1 h-4 border border-line" style={{ background: grad }}>
            <input
              type="range"
              min={0}
              max={255}
              value={rgb[chave]}
              onChange={(e) => onChange({ ...rgb, [chave]: Number(e.target.value) })}
              aria-label={`Canal ${rotulo}`}
              className="w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <input
            type="number"
            min={0}
            max={255}
            value={rgb[chave]}
            onChange={(e) =>
              onChange({ ...rgb, [chave]: Math.max(0, Math.min(255, Number(e.target.value) || 0)) })
            }
            aria-label={`Valor do canal ${rotulo}`}
            className="w-12 shrink-0 bg-panel border border-line text-ink text-[0.75rem] text-center py-1"
          />
        </div>
      ))}
    </div>
  );
}

// --- componente principal ----------------------------------------------------------------

type Props = {
  /** Hex de 6 dígitos, com #. */
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
  /** Cores já usadas em outros cargos, oferecidas como atalho. */
  recentes?: string[];
  className?: string;
};

export function ColorPicker({
  value,
  onChange,
  disabled,
  title,
  'aria-label': ariaLabel,
  recentes = [],
  className,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [aba, setAba] = useState<Aba>('Grade');
  const [hsv, setHsv] = useState(() => rgbToHsv(hexToRgb(value)));
  const [rascunhoHex, setRascunhoHex] = useState(value.replace('#', ''));

  // O valor pode mudar por fora (sync do Discord, outro cargo). Só realinha quando o popover
  // está fechado, pra não brigar com o que a pessoa está arrastando.
  useEffect(() => {
    if (aberto) return;
    setHsv(rgbToHsv(hexToRgb(value)));
    setRascunhoHex(value.replace('#', ''));
  }, [value, aberto]);

  const rgb = hexToRgb(value);
  const contraste = contrasteNoPainel(value);

  function aplicar(hex: string) {
    onChange(hex);
    setHsv(rgbToHsv(hexToRgb(hex)));
    setRascunhoHex(hex.replace('#', ''));
  }

  const temConta_gotas = typeof window !== 'undefined' && 'EyeDropper' in window;
  async function contaGotas() {
    try {
      // @ts-expect-error EyeDropper ainda não está no lib.dom padrão
      const resultado = await new window.EyeDropper().open();
      if (resultado?.sRGBHex) aplicar(resultado.sRGBHex.toLowerCase());
    } catch {
      /* pessoa cancelou */
    }
  }

  return (
    <Popover.Root open={aberto} onOpenChange={setAberto}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          title={title}
          aria-label={ariaLabel}
          style={{ backgroundColor: value }}
          className={cn(
            'w-7 h-7 shrink-0 border border-line cursor-pointer transition-shadow',
            'hover:shadow-[0_0_0_2px_rgba(255,22,51,0.35)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          collisionPadding={12}
          // Precisa ficar acima do DialogContent do painel ADM, que é z-[1001].
          className="z-[1100] w-[272px] bg-panel border border-line p-3.5 shadow-2xl relative animate-fade-in"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <span className="pointer-events-none absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-brand" />
          <span className="pointer-events-none absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-brand" />

          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-[0.72rem] font-bold tracking-[2px] text-ink">
              COR DO CARGO
            </span>
            {temConta_gotas && (
              <button
                type="button"
                onClick={contaGotas}
                title="Capturar uma cor da tela"
                className="text-ink-dim hover:text-brand transition-colors"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m2 22 1-1h3l9-9" />
                  <path d="M3 21v-3l9-9" />
                  <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
                </svg>
              </button>
            )}
          </div>

          <Abas atual={aba} onChange={setAba} />

          {aba === 'Grade' && <Grade valor={value} onChange={aplicar} />}
          {aba === 'Espectro' && (
            <Espectro
              hsv={hsv}
              onChange={(novo) => {
                setHsv(novo);
                const hex = rgbToHex(hsvToRgb(novo));
                onChange(hex);
                setRascunhoHex(hex.replace('#', ''));
              }}
            />
          )}
          {aba === 'RGB' && <CanaisRGB rgb={rgb} onChange={(novo) => aplicar(rgbToHex(novo))} />}

          <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-line">
            <span className="w-9 h-9 shrink-0 border border-line" style={{ backgroundColor: value }} />
            <label className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-ink-dim text-[0.85rem]">#</span>
              <input
                value={rascunhoHex}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                  setRascunhoHex(v);
                  if (v.length === 6) aplicar('#' + v.toLowerCase());
                }}
                onBlur={() => setRascunhoHex(value.replace('#', ''))}
                aria-label="Código hexadecimal da cor"
                maxLength={6}
                className="w-full min-w-0 bg-panel-2 border border-line text-ink text-[0.85rem] uppercase tracking-wider px-2 py-1.5"
              />
            </label>
          </div>

          {contraste < 3 && (
            <p className="mt-2.5 text-[0.7rem] text-brand leading-snug">
              Essa cor quase some no fundo escuro dos cards. Considere uma mais clara.
            </p>
          )}

          {recentes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-line">
              <div className="text-[0.68rem] font-bold tracking-wide text-ink-dim uppercase mb-2">
                Já usadas
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentes.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => aplicar(cor)}
                    title={cor}
                    aria-label={`Usar ${cor}`}
                    style={{ backgroundColor: cor }}
                    className="w-5 h-5 border border-line hover:outline hover:outline-1 hover:outline-ink"
                  />
                ))}
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
