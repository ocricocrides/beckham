import { useState, type FormEvent } from 'react';
import { Check, Pencil, Play, X } from 'lucide-react';
import { Btn } from '@/components/layout/Btn';
import { ClipPlayerModal } from '@/components/home/ClipsSection';
import { useConfirm } from '@/hooks/useConfirm';
import { useFeaturedClips, useClipCategories, type ClipCategory, type FeaturedClip } from '@/hooks/useFeaturedClips';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProfiles } from '@/hooks/useProfiles';
import { parseClipUrl, CLIP_SOURCE_LABEL } from '@/lib/clips';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const fieldClass = 'font-body bg-panel border border-line text-ink px-2.5 py-1.5 text-[0.85rem]';
const noSpinnerClass =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

type ClipPatch = { sort_order?: number; category_id?: string | null; member_id?: string | null };

export default function AdminDestaquesPage() {
  usePageMeta('Destaques // Painel ADM', 'Clipes e vídeos que aparecem na página inicial da BECKHAM.');

  const { clips, reload } = useFeaturedClips();
  const { categories, reload: reloadCategories } = useClipCategories();
  const { profiles } = useProfiles();
  const confirm = useConfirm();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [order, setOrder] = useState('0');
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'' | 'error' | 'success'>('');
  const [preview, setPreview] = useState<FeaturedClip | null>(null);

  const [newCategory, setNewCategory] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const parsed = url.trim() ? parseClipUrl(url) : null;

  function flash(kind: 'error' | 'success', text: string) {
    setMsgKind(kind);
    setMsg(text);
  }

  // ---- Categorias ----

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    const nextOrder = categories.length ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 0;
    const { error } = await supabase.from('clip_categories').insert({ name, sort_order: nextOrder });
    if (error) {
      flash('error', 'Erro: ' + error.message);
      return;
    }
    setNewCategory('');
    flash('success', `Categoria "${name}" criada.`);
    reloadCategories();
  }

  async function handleRenameCategory(id: string) {
    const name = renameValue.trim();
    if (!name) return;
    const { error } = await supabase.from('clip_categories').update({ name }).eq('id', id);
    if (error) {
      flash('error', 'Erro: ' + error.message);
      return;
    }
    setRenamingId(null);
    flash('success', 'Categoria renomeada.');
    reloadCategories();
  }

  async function handleCategoryOrder(cat: ClipCategory, value: number) {
    const { error } = await supabase.from('clip_categories').update({ sort_order: value }).eq('id', cat.id);
    if (error) flash('error', 'Erro: ' + error.message);
    else reloadCategories();
  }

  async function handleDeleteCategory(cat: ClipCategory) {
    const usados = clips?.filter((c) => c.category_id === cat.id).length ?? 0;
    const aviso = usados
      ? ` Os ${usados} clipe(s) dela continuam na página, só ficam sem categoria.`
      : '';
    if (!(await confirm(`Excluir a categoria "${cat.name}"?${aviso}`))) return;
    const { error } = await supabase.from('clip_categories').delete().eq('id', cat.id);
    if (error) {
      flash('error', 'Erro: ' + error.message);
      return;
    }
    if (categoryId === cat.id) setCategoryId('');
    flash('success', 'Categoria excluída.');
    reloadCategories();
    reload();
  }

  // ---- Clipes ----

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!parsed) {
      flash('error', 'Link não reconhecido. Use YouTube, Shorts, clipe/VOD da Twitch, TikTok ou Streamable.');
      return;
    }
    const { error } = await supabase.from('featured_clips').insert({
      url: url.trim(),
      title: title.trim(),
      category_id: categoryId || null,
      member_id: memberId || null,
      sort_order: parseInt(order, 10) || 0,
    });
    if (error) {
      flash('error', 'Erro: ' + error.message);
      return;
    }
    setUrl('');
    setTitle('');
    setMemberId('');
    setOrder('0');
    flash('success', 'Clipe adicionado na página inicial.');
    reload();
  }

  async function handleUpdate(id: string, patch: ClipPatch) {
    const { error } = await supabase.from('featured_clips').update(patch).eq('id', id);
    if (error) flash('error', 'Erro: ' + error.message);
    else reload();
  }

  async function handleDelete(clip: FeaturedClip) {
    if (!(await confirm(`Tirar "${clip.title}" dos destaques?`))) return;
    const { error } = await supabase.from('featured_clips').delete().eq('id', clip.id);
    if (error) flash('error', 'Erro: ' + error.message);
    else {
      flash('success', 'Clipe removido.');
      reload();
    }
  }

  const categoryOptions = (
    <>
      <option value="">Sem categoria</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </>
  );

  return (
    <div>
      <div className="mb-9">
        <h4 className="text-ink text-[1rem] tracking-wide mb-1">Categorias</h4>
        <p className="text-ink-dim text-[0.78rem] mb-3">
          Viram os filtros da seção "Destaques" na página inicial. Só aparece como filtro a categoria que tiver
          algum clipe.
        </p>
        <form className="flex gap-2 flex-wrap max-w-[480px] mb-3" onSubmit={handleAddCategory}>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nova categoria (ex: Resenha, Ações, Fugas)"
            maxLength={30}
            required
            className={cn(fieldClass, 'flex-1 min-w-[180px]')}
          />
          <Btn type="submit" variant="primary">
            Criar
          </Btn>
        </form>

        {categories.length === 0 ? (
          <p className="text-ink-dim text-[0.85rem]">Nenhuma categoria ainda.</p>
        ) : (
          <div className="flex flex-col gap-1.5 max-w-[480px]">
            {categories.map((cat) => {
              const usados = clips?.filter((c) => c.category_id === cat.id).length ?? 0;
              return (
                <div key={cat.id} className="bg-panel-2 border border-line px-3 py-2 flex items-center gap-2 text-[0.85rem]">
                  <input
                    key={cat.sort_order}
                    type="number"
                    defaultValue={cat.sort_order}
                    title="Ordem do filtro: quanto menor, mais pra frente"
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v) && v !== cat.sort_order) handleCategoryOrder(cat, v);
                    }}
                    className={cn(fieldClass, noSpinnerClass, 'w-[52px] text-[0.78rem] py-1')}
                  />
                  {renamingId === cat.id ? (
                    <>
                      <input
                        autoFocus
                        value={renameValue}
                        maxLength={30}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleRenameCategory(cat.id);
                          }
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className={cn(fieldClass, 'flex-1 min-w-0 py-1')}
                      />
                      <button
                        type="button"
                        title="Salvar nome"
                        onClick={() => handleRenameCategory(cat.id)}
                        className="text-ink-dim hover:text-brand px-1"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        title="Cancelar"
                        onClick={() => setRenamingId(null)}
                        className="text-ink-dim hover:text-brand px-1"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-ink font-semibold truncate">{cat.name}</span>
                      <span className="text-ink-dim text-[0.72rem]">{usados} clipe(s)</span>
                      <button
                        type="button"
                        title="Renomear"
                        onClick={() => {
                          setRenamingId(cat.id);
                          setRenameValue(cat.name);
                        }}
                        className="text-ink-dim hover:text-brand px-1"
                      >
                        <Pencil size={14} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    title="Excluir categoria"
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-ink-dim hover:text-brand text-[1.1rem] leading-none px-1"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-9">
        <h4 className="text-ink text-[1rem] tracking-wide mb-1">Adicionar clipe</h4>
        <p className="text-ink-dim text-[0.78rem] mb-3">
          Cole o link do vídeo. Aceita YouTube (e Shorts), clipe ou VOD da Twitch, TikTok e Streamable. Ele aparece
          na seção "Destaques" da página inicial.
        </p>
        <form className="flex flex-col gap-2 max-w-[680px]" onSubmit={handleAdd}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            required
            className={fieldClass}
          />
          {url.trim() && (
            <span className={cn('text-[0.75rem]', parsed ? 'text-[#3ddc84]' : 'text-brand')}>
              {parsed ? `Link do ${CLIP_SOURCE_LABEL[parsed.source]} reconhecido.` : 'Link não reconhecido.'}
            </span>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (ex: Fuga épica no Banco Central)"
            required
            maxLength={80}
            className={fieldClass}
          />
          <div className="flex gap-2 flex-wrap">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={fieldClass}>
              {categoryOptions}
            </select>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className={cn(fieldClass, 'flex-1 min-w-[160px]')}
            >
              <option value="">Membro (opcional)</option>
              {(profiles ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name || p.username}
                </option>
              ))}
            </select>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              type="number"
              title="Ordem: quanto menor, mais pra frente"
              placeholder="Ordem"
              className={cn(fieldClass, noSpinnerClass, 'w-[80px]')}
            />
            <Btn type="submit" variant="primary">
              Adicionar
            </Btn>
          </div>
        </form>
      </div>

      <h4 className="text-ink text-[1rem] tracking-wide mb-3">Clipes em destaque</h4>
      {!clips?.length ? (
        <p className="text-ink-dim text-[0.85rem]">Nenhum clipe ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {clips.map((clip) => {
            const p = parseClipUrl(clip.url);
            return (
              <div
                key={clip.id}
                className="bg-panel-2 border border-line px-3 py-2.5 flex items-center gap-3 flex-wrap text-[0.85rem]"
              >
                <button
                  type="button"
                  title="Assistir"
                  onClick={() => setPreview(clip)}
                  className="w-[72px] aspect-video bg-panel border border-line shrink-0 relative overflow-hidden text-ink-dim hover:text-brand"
                >
                  {p?.thumbnail && (
                    <img src={p.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                  )}
                  <Play size={14} className="relative m-auto" />
                </button>
                <div className="flex-1 min-w-[160px]">
                  <div className="text-ink font-semibold truncate">{clip.title}</div>
                  <div className="text-ink-dim text-[0.72rem] truncate">
                    {p ? CLIP_SOURCE_LABEL[p.source] : 'link inválido'} · {clip.url}
                  </div>
                </div>
                <select
                  value={clip.category_id ?? ''}
                  onChange={(e) => handleUpdate(clip.id, { category_id: e.target.value || null })}
                  className={cn(fieldClass, 'text-[0.78rem] py-1 max-w-[150px]')}
                >
                  {categoryOptions}
                </select>
                <select
                  value={clip.member_id ?? ''}
                  onChange={(e) => handleUpdate(clip.id, { member_id: e.target.value || null })}
                  className={cn(fieldClass, 'text-[0.78rem] py-1 max-w-[150px]')}
                >
                  <option value="">Sem membro</option>
                  {(profiles ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name || m.username}
                    </option>
                  ))}
                </select>
                <input
                  key={clip.sort_order}
                  type="number"
                  defaultValue={clip.sort_order}
                  title="Ordem: quanto menor, mais pra frente"
                  onBlur={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v) && v !== clip.sort_order) handleUpdate(clip.id, { sort_order: v });
                  }}
                  className={cn(fieldClass, noSpinnerClass, 'w-[64px] text-[0.78rem] py-1')}
                />
                <button
                  type="button"
                  title="Remover dos destaques"
                  onClick={() => handleDelete(clip)}
                  className="text-ink-dim hover:text-brand text-[1.1rem] leading-none px-1.5"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div
        className={cn(
          'mt-5 text-[0.85rem] min-h-[1.2em] text-ink-dim',
          msgKind === 'error' && 'text-brand',
          msgKind === 'success' && 'text-[#3ddc84]',
        )}
      >
        {msg}
      </div>

      <ClipPlayerModal clip={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
