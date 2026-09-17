import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Btn } from '@/components/layout/Btn';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import { useWallPosts, type WallPost } from '@/hooks/useWallPosts';
import { supabase } from '@/lib/supabase';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { HomeSectionHead, Reveal } from './Reveal';

const MAX_LEN = 280;

function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 30) return `há ${Math.floor(s / 86400)} d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

function PostCard({
  post,
  canDelete,
  onDelete,
  index,
}: {
  post: WallPost;
  canDelete: boolean;
  onDelete: () => void;
  index: number;
}) {
  const name = post.member?.display_name || post.member?.username || 'Membro';
  return (
    <Reveal delay={Math.min(index, 8) * 80} className="break-inside-avoid mb-3">
    <div className="relative bg-panel border border-line p-4 transition-[transform,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-brand/60">
      {canDelete && (
        <button
          type="button"
          title="Apagar recado"
          onClick={onDelete}
          className="absolute top-2 right-2 text-ink-dim hover:text-brand p-1"
        >
          <X size={14} />
        </button>
      )}
      <p className="text-ink text-[0.95rem] leading-[1.55] whitespace-pre-line break-words pr-4">“{post.body}”</p>
      <div className="flex items-center gap-2 mt-3">
        <img src={post.member?.avatar_url || DEFAULT_AVATAR} alt="" className="w-6 h-6 rounded-full object-cover" />
        {post.member ? (
          <Link to={`/perfil/${post.member.username}`} className="text-ink-dim text-[0.8rem] font-bold hover:text-brand">
            {name}
          </Link>
        ) : (
          <span className="text-ink-dim text-[0.8rem] font-bold">{name}</span>
        )}
        <span className="text-ink-dim/70 text-[0.72rem]">· {timeAgo(post.created_at)}</span>
      </div>
    </div>
    </Reveal>
  );
}

export function WallSection() {
  const { user, isAdmin, isMember } = useAuth();
  const { posts, loading, reload } = useWallPosts(18);
  const confirm = useConfirm();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const text = body.trim();
    if (text.length < 3) {
      setError('Escreve um pouquinho mais.');
      return;
    }
    setSending(true);
    setError('');
    const { error: err } = await supabase.from('wall_posts').insert({ body: text, member_id: user.id });
    setSending(false);
    if (err) {
      setError(err.message.includes('Espere') ? 'Espere uns minutos antes de postar outro recado.' : 'Não deu pra postar agora.');
      return;
    }
    setBody('');
    reload();
  }

  async function handleDelete(post: WallPost) {
    if (!(await confirm('Apagar esse recado do mural?'))) return;
    const { error: err } = await supabase.from('wall_posts').delete().eq('id', post.id);
    if (err) alert('Erro ao apagar: ' + err.message);
    else reload();
  }

  return (
    <>
      <Reveal>
        <HomeSectionHead kicker="MURAL" title="O que a tropa diz da fac" />
      </Reveal>

      <Reveal className="mb-6">
        {user && isMember ? (
          <form onSubmit={handleSubmit} className="bg-panel border border-line p-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_LEN))}
              placeholder="Deixa teu recado sobre a BECKHAM…"
              rows={3}
              className="w-full bg-transparent text-ink placeholder:text-ink-dim/70 resize-none outline-none text-[0.95rem]"
            />
            <div className="flex items-center justify-between gap-3 mt-2">
              <span className={cn('text-[0.75rem]', error ? 'text-brand' : 'text-ink-dim')}>
                {error || `${body.length}/${MAX_LEN}`}
              </span>
              <Btn type="submit" variant="primary" disabled={sending || body.trim().length < 3}>
                {sending ? 'Postando…' : 'Postar recado'}
              </Btn>
            </div>
          </form>
        ) : (
          <p className="text-ink-dim text-[0.9rem] border border-dashed border-line px-4 py-3">
            Faça parte da BECKHAM e entre na sua conta pra deixar um recado no mural.
          </p>
        )}
      </Reveal>

      {loading ? (
        <div className="skeleton h-[120px]" />
      ) : posts!.length === 0 ? (
        <p className="text-ink-dim text-[0.9rem]">Ninguém escreveu ainda. Seja o primeiro.</p>
      ) : (
        <div className="columns-1 min-[640px]:columns-2 min-[980px]:columns-3 gap-3">
          {posts!.map((post, i) => (
            <PostCard
              key={post.id}
              index={i}
              post={post}
              canDelete={isAdmin}
              onDelete={() => handleDelete(post)}
            />
          ))}
        </div>
      )}
    </>
  );
}
