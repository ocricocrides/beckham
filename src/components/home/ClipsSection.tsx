import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useFeaturedClips, useClipCategories, type FeaturedClip } from '@/hooks/useFeaturedClips';
import { parseClipUrl, CLIP_SOURCE_LABEL } from '@/lib/clips';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { HomeSectionHead, Reveal } from './Reveal';

/** 'todos' ou o id de uma categoria. */
type Filter = string;

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'clip-corner-sm border border-transparent text-ink-dim text-[0.82rem] font-bold tracking-wide px-4 py-2 transition-colors hover:text-ink',
            value === o.id && 'text-ink bg-brand/[0.08] border-line',
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 text-ink-dim font-semibold">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

function ClipCard({
  clip,
  categoryName,
  onPlay,
}: {
  clip: FeaturedClip;
  categoryName: string | null;
  onPlay: () => void;
}) {
  const parsed = parseClipUrl(clip.url);
  return (
    <button
      type="button"
      onClick={onPlay}
      className="group block w-full text-left bg-panel border border-line overflow-hidden transition-[transform,border-color,box-shadow] duration-500 ease-out-expo hover:-translate-y-1.5 hover:border-brand hover:shadow-[0_18px_40px_-20px_rgba(255,22,51,0.65)]"
    >
      <div className="relative aspect-video bg-panel-2 overflow-hidden">
        {parsed?.thumbnail ? (
          <img
            src={parsed.thumbnail}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-80 transition-[transform,opacity] duration-[900ms] ease-out-expo group-hover:scale-110 group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,22,51,0.25),transparent_60%)]">
            <picture>
              <source srcSet="/assets/logo.webp" type="image/webp" />
              <img src="/assets/logo.png" alt="" className="absolute inset-0 m-auto w-1/2 opacity-20" />
            </picture>
          </div>
        )}
        <span className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-brand/90 text-[#0a0a0a] flex items-center justify-center scale-90 opacity-90 transition-[transform,opacity,box-shadow] duration-500 ease-spring group-hover:scale-110 group-hover:opacity-100 group-hover:shadow-[0_0_0_10px_rgba(255,22,51,0.15)]">
          <Play size={20} fill="currentColor" className="ml-0.5" />
        </span>
        {categoryName && (
          <span className="absolute top-2 left-2 bg-void/80 border border-line text-ink text-[0.68rem] font-bold tracking-wide px-2 py-0.5">
            {categoryName}
          </span>
        )}
        {parsed && (
          <span className="absolute top-2 right-2 bg-void/80 text-ink-dim text-[0.68rem] font-semibold px-2 py-0.5">
            {CLIP_SOURCE_LABEL[parsed.source]}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="text-ink font-semibold text-[0.95rem] leading-snug line-clamp-2">{clip.title}</div>
        {clip.member && (
          <div className="flex items-center gap-2 mt-2 text-ink-dim text-[0.78rem]">
            <img src={clip.member.avatar_url || DEFAULT_AVATAR} alt="" className="w-5 h-5 rounded-full object-cover" />
            {clip.member.display_name || clip.member.username}
          </div>
        )}
      </div>
    </button>
  );
}

export function ClipPlayerModal({ clip, onClose }: { clip: FeaturedClip | null; onClose: () => void }) {
  const parsed = clip ? parseClipUrl(clip.url) : null;
  return (
    <Dialog open={!!clip} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'bg-panel border border-line rounded-none p-0 gap-0 text-ink overflow-hidden duration-300 [&>button]:text-ink [&>button]:opacity-100 [&>button]:bg-void/80 [&>button]:p-1',
          parsed?.vertical ? 'max-w-[min(92vw,380px)]' : 'max-w-[min(94vw,960px)]',
        )}
      >
        <DialogTitle className="sr-only">{clip?.title}</DialogTitle>
        {clip && parsed ? (
          <>
            <div className={cn('bg-black', parsed.vertical ? 'aspect-[9/16] max-h-[78vh]' : 'aspect-video')}>
              <iframe
                src={parsed.embedUrl}
                title={clip.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{clip.title}</div>
                {clip.member && (
                  <Link
                    to={`/perfil/${clip.member.username}`}
                    onClick={onClose}
                    className="text-ink-dim text-[0.8rem] hover:text-brand"
                  >
                    {clip.member.display_name || clip.member.username}
                  </Link>
                )}
              </div>
              <a
                href={clip.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-ink-dim text-[0.8rem] hover:text-brand"
              >
                Abrir no {CLIP_SOURCE_LABEL[parsed.source]} ↗
              </a>
            </div>
          </>
        ) : (
          clip && (
            <div className="p-6 text-ink-dim text-[0.9rem]">
              Não consegui tocar esse link aqui.{' '}
              <a href={clip.url} target="_blank" rel="noopener noreferrer" className="text-brand">
                Abrir o vídeo ↗
              </a>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ClipsSection() {
  const { clips, loading } = useFeaturedClips();
  const { categories } = useClipCategories();
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<Filter>('todos');
  const [playing, setPlaying] = useState<FeaturedClip | null>(null);

  if (loading) return null;
  // Sem clipe cadastrado, a seção some pro público; a ADM vê um atalho pra cadastrar.
  if (!clips?.length) {
    if (!isAdmin) return null;
    return (
      <div className="border border-dashed border-line p-6 text-center text-ink-dim text-[0.9rem]">
        Nenhum clipe em destaque ainda.{' '}
        <Link to="/admin/destaques" className="text-brand font-bold hover:underline">
          Adicionar clipes
        </Link>
      </div>
    );
  }

  const visible = filter === 'todos' ? clips : clips.filter((c) => c.category_id === filter);
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? null;
  // Só vira aba a categoria que tem pelo menos um clipe.
  const filters = [
    { id: 'todos', label: 'Todos', count: clips.length },
    ...categories
      .map((c) => ({ id: c.id, label: c.name, count: clips.filter((clip) => clip.category_id === c.id).length }))
      .filter((f) => f.count > 0),
  ];

  return (
    <>
      <Reveal>
        <HomeSectionHead kicker="DESTAQUES" title="Clipes da BECKHAM">
          {filters.length > 2 && <FilterTabs options={filters} value={filter} onChange={setFilter} />}
        </HomeSectionHead>
      </Reveal>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {visible.map((clip, i) => (
          <Reveal key={clip.id} delay={Math.min(i, 6) * 110}>
            <ClipCard clip={clip} categoryName={categoryName(clip.category_id)} onPlay={() => setPlaying(clip)} />
          </Reveal>
        ))}
      </div>
      {visible.length === 0 && <p className="text-ink-dim text-[0.9rem]">Nada nessa categoria ainda.</p>}

      <ClipPlayerModal clip={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
