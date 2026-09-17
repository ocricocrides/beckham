import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ChevronDown, Pencil, Check, X } from 'lucide-react';
import { Btn } from '@/components/layout/Btn';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import { useDiscordRoles, type DiscordRole } from '@/hooks/useDiscordRoles';
import { useConfirm } from '@/hooks/useConfirm';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ColorPicker } from '@/components/ui/color-picker';
import { Switch } from '@/components/ui/switch';
import type { Role } from '@/lib/supabase';

type RolePatch = Partial<
  Pick<
    Role,
    | 'tipo'
    | 'is_admin'
    | 'can_post_photos'
    | 'can_delete_photos'
    | 'can_post_announcements'
    | 'can_delete_announcements'
    | 'sort_order'
    | 'show_on_card'
    | 'is_streamer'
  >
>;

const selectClass = 'font-body bg-panel border border-line text-ink px-2.5 py-1.5 text-[0.85rem]';
/** Tira as setinhas nativas do input number (Chrome/Safari e Firefox precisam de regras diferentes). */
const noSpinnerClass = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

/** Mesmo vermelho do tema (tailwind.config.ts). Cargo sem cor definida cai nele. */
const BRAND_RED = '#ff1633';

export default function AdminCargosPage() {
  usePageMeta('Cargos // Painel ADM', 'Gestão de cargos e dos cargos de cada membro da BECKHAM.');

  const { refreshProfile } = useAuth();
  const { roles, reload: reloadRoles } = useRoles();
  const { discordRoles, error: discordError, loading: discordLoading, reload: reloadDiscord } =
    useDiscordRoles(true);
  const confirm = useConfirm();

  const [roleName, setRoleName] = useState('');
  const [roleOrder, setRoleOrder] = useState('');
  const [roleColor, setRoleColor] = useState(BRAND_RED);
  const [roleTipo, setRoleTipo] = useState<'principal' | 'secundario'>('secundario');
  const [roleIsAdmin, setRoleIsAdmin] = useState(false);

  // Cores já aplicadas em outros cargos, oferecidas como atalho dentro do seletor.
  const coresEmUso = Array.from(
    new Set(roles.map((r) => r.color).filter((c): c is string => !!c)),
  );
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'' | 'error' | 'success'>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAddRole(e: FormEvent) {
    e.preventDefault();
    const order = parseInt(roleOrder, 10);
    const { error } = await supabase
      .from('roles')
      .insert({ name: roleName.trim(), sort_order: order, color: roleColor, tipo: roleTipo, is_admin: roleIsAdmin });
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setRoleName('');
    setRoleOrder('');
    setRoleColor(BRAND_RED);
    setRoleTipo('secundario');
    setRoleIsAdmin(false);
    setMsgKind('success');
    setMsg('Cargo criado.');
    reloadRoles();
  }

  async function handleRoleColorChange(id: string, color: string) {
    const { error } = await supabase.from('roles').update({ color }).eq('id', id);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setMsgKind('success');
    setMsg('Cor do cargo atualizada.');
    reloadRoles();
  }

  /** Atualiza tipo/ADM/permissões de um cargo já existente (editado direto na linha dele). */
  async function handleRoleUpdate(id: string, patch: RolePatch) {
    const { error } = await supabase.from('roles').update(patch).eq('id', id);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setMsgKind('success');
    setMsg('Cargo atualizado.');
    reloadRoles();
    refreshProfile();
  }

  /** Liga (ou desliga) um cargo do site a um cargo do Discord, herdando a cor de lá. */
  async function handleDiscordLink(roleId: string, discordRoleId: string) {
    const alvo = discordRoles?.find((d) => d.id === discordRoleId);
    const patch = discordRoleId
      ? { discord_role_id: discordRoleId, color: alvo?.color ?? null }
      : { discord_role_id: null };
    const { error } = await supabase.from('roles').update(patch).eq('id', roleId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setMsgKind('success');
    setMsg(discordRoleId ? `Cargo espelhado em "${alvo?.name}".` : 'Vínculo removido.');
    reloadRoles();
  }

  /**
   * Grava nos cargos vinculados a cor que está hoje no Discord. Devolve quantos mudaram.
   * Cargo apagado lá não é mexido — melhor manter a cor antiga do que zerar sem aviso.
   */
  async function aplicarCoresDoDiscord(lista: DiscordRole[]) {
    const vinculados = roles.filter((r) => r.discord_role_id);
    let mudou = 0;
    for (const r of vinculados) {
      const d = lista.find((x) => x.id === r.discord_role_id);
      if (!d || d.color === r.color) continue;
      const { error } = await supabase.from('roles').update({ color: d.color }).eq('id', r.id);
      if (!error) mudou++;
    }
    if (mudou > 0) {
      reloadRoles();
    }
    return { vinculados: vinculados.length, mudou };
  }

  /** Botão manual: relê o Discord e aplica, sempre com resposta na tela. */
  async function handleSyncDiscordColors() {
    const lista = await reloadDiscord();
    if (!lista) {
      setMsgKind('error');
      setMsg('Não consegui ler os cargos do Discord agora.');
      return;
    }
    const { vinculados, mudou } = await aplicarCoresDoDiscord(lista);
    setMsgKind('success');
    setMsg(
      vinculados === 0
        ? 'Nenhum cargo está espelhado no Discord ainda.'
        : mudou === 0
          ? 'As cores já estavam em dia.'
          : `${mudou} cor(es) atualizada(s) a partir do Discord.`,
    );
  }

  // Sincronização automática: assim que os cargos do Discord chegam (uma vez por visita à
  // página), as cores vinculadas são conferidas em silêncio. Só avisa na tela se algo mudou.
  const autoSyncFeito = useRef(false);
  useEffect(() => {
    if (autoSyncFeito.current || !discordRoles || roles.length === 0) return;
    autoSyncFeito.current = true;
    aplicarCoresDoDiscord(discordRoles).then(({ mudou }) => {
      if (mudou > 0) {
        setMsgKind('success');
        setMsg(`${mudou} cor(es) sincronizada(s) do Discord.`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discordRoles, roles]);

  function startRename(r: Role) {
    setRenamingId(r.id);
    setRenameValue(r.name);
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue('');
  }

  async function handleRenameRole(id: string) {
    const novoNome = renameValue.trim();
    if (!novoNome) return;
    const { error } = await supabase.from('roles').update({ name: novoNome }).eq('id', id);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setMsgKind('success');
    setMsg('Cargo renomeado.');
    setRenamingId(null);
    setRenameValue('');
    reloadRoles();
    refreshProfile();
  }

  async function handleDeleteRole(id: string) {
    if (!(await confirm('Excluir esse cargo? Membros com ele ficam sem esse cargo.'))) return;
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    reloadRoles();
  }

  return (
    <div>
      <div className="mb-9">
        <h4 className="text-ink text-[1rem] tracking-wide mb-3">Criar cargo</h4>
        <form className="flex gap-2 flex-wrap items-center" onSubmit={handleAddRole}>
          <ColorPicker
            value={roleColor}
            onChange={setRoleColor}
            recentes={coresEmUso}
            title="Cor do novo cargo"
            aria-label="Cor do novo cargo"
            className="w-9 h-9"
          />
          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Nome do cargo (ex: Líder)"
            required
            maxLength={30}
            className={cn(selectClass, 'flex-1 min-w-[140px]')}
          />
          <input
            value={roleOrder}
            onChange={(e) => setRoleOrder(e.target.value)}
            type="number"
            placeholder="Ordem"
            title="Quanto menor, mais alto na hierarquia"
            required
            min={0}
            step={1}
            className={cn(selectClass, noSpinnerClass, 'w-[90px]')}
          />
          <select
            value={roleTipo}
            onChange={(e) => setRoleTipo(e.target.value as 'principal' | 'secundario')}
            title="Principal: só 1 por membro (troca ao trocar). Secundário: pode acumular vários."
            className={selectClass}
          >
            <option value="principal">Principal</option>
            <option value="secundario">Secundário</option>
          </select>
          <label
            className="flex items-center gap-2 text-ink-dim text-[0.85rem] cursor-pointer"
            onClick={() => setRoleIsAdmin((v) => !v)}
          >
            <Switch checked={roleIsAdmin} onChange={setRoleIsAdmin} />
            Administrador
          </label>
          <Btn type="submit" variant="primary">
            Adicionar
          </Btn>
        </form>
        <p className="mt-3 text-ink-dim text-[0.78rem]">
          As permissões de postar/apagar fotos e anúncios, e o vínculo com o Discord, ficam editáveis no cargo depois
          de criado. É só clicar nele na lista abaixo.
        </p>

        <div className="mt-4 text-[0.78rem]">
          {discordLoading && <span className="text-ink-dim">Lendo os cargos do Discord…</span>}
          {discordError && <span className="text-brand">Discord indisponível: {discordError}</span>}
          {discordRoles && (
            <button
              type="button"
              onClick={handleSyncDiscordColors}
              className="bg-none border border-line text-ink-dim hover:text-brand hover:border-brand transition-colors cursor-pointer px-2.5 py-1.5 tracking-wide"
            >
              Sincronizar cores do Discord
            </button>
          )}
        </div>
      </div>

      <div className="mb-7">
        <h4 className="text-ink text-[1rem] tracking-wide mb-3">Cargos</h4>
        <div className="flex flex-col gap-2">
          {roles.length === 0 && <p className="text-ink-dim text-[0.85rem]">Nenhum cargo criado ainda.</p>}
          {roles.map((r) => {
            const isOpen = expandedIds.has(r.id);
            return (
              <div key={r.id} className="bg-panel-2 border border-line px-3 py-2.5 text-[0.9rem]">
                <div
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                  onClick={() => toggleExpanded(r.id)}
                >
                  <span onClick={(e) => e.stopPropagation()}>
                    <ColorPicker
                      value={r.color || BRAND_RED}
                      onChange={(hex) => handleRoleColorChange(r.id, hex)}
                      disabled={!!r.discord_role_id}
                      recentes={coresEmUso}
                      title={
                        r.discord_role_id
                          ? 'A cor vem do Discord. Desvincule pra editar na mão.'
                          : `Cor do cargo ${r.name}`
                      }
                      aria-label={`Cor do cargo ${r.name}`}
                    />
                  </span>
                  {renamingId === r.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleRenameRole(r.id);
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelRename();
                        }
                      }}
                      maxLength={30}
                      className={cn(selectClass, 'flex-1 min-w-0 py-1')}
                    />
                  ) : (
                    <span className="flex-1 font-semibold" style={{ color: r.color || BRAND_RED }}>
                      {r.name}
                    </span>
                  )}
                  {renamingId === r.id ? (
                    <>
                      <button
                        type="button"
                        title="Salvar nome"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameRole(r.id);
                        }}
                        className="bg-none border-none text-ink-dim hover:text-brand cursor-pointer px-1.5 py-0.5"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        title="Cancelar"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelRename();
                        }}
                        className="bg-none border-none text-ink-dim hover:text-brand cursor-pointer px-1.5 py-0.5"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      title="Renomear cargo"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(r);
                      }}
                      className="bg-none border-none text-ink-dim hover:text-brand cursor-pointer px-1.5 py-0.5"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Excluir cargo"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(r.id);
                    }}
                    className="bg-none border-none text-ink-dim hover:text-brand cursor-pointer text-[1.1rem] leading-none px-1.5 py-0.5"
                  >
                    ×
                  </button>
                  <ChevronDown
                    size={16}
                    className={cn('text-ink-dim transition-transform shrink-0', isOpen && 'rotate-180')}
                  />
                </div>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-line">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.78rem] text-ink-dim mb-2">
                      <label className="flex items-center gap-1.5">
                        <span className="shrink-0">Ordem:</span>
                        <input
                          key={r.sort_order}
                          type="number"
                          defaultValue={r.sort_order}
                          title="Quanto menor, mais alto na hierarquia"
                          min={0}
                          step={1}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!Number.isNaN(value) && value !== r.sort_order) {
                              handleRoleUpdate(r.id, { sort_order: value });
                            }
                          }}
                          className={cn(selectClass, noSpinnerClass, 'w-[80px] text-[0.78rem] py-1')}
                        />
                      </label>
                      <label className="flex items-center gap-1.5">
                        <span className="shrink-0">Tipo:</span>
                        <select
                          value={r.tipo}
                          onChange={(e) =>
                            handleRoleUpdate(r.id, { tipo: e.target.value as 'principal' | 'secundario' })
                          }
                          title="Principal: só 1 por membro (troca ao trocar). Secundário: pode acumular vários."
                          className={cn(selectClass, 'text-[0.78rem] py-1')}
                        >
                          <option value="principal">Principal</option>
                          <option value="secundario">Secundário</option>
                        </select>
                      </label>
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleRoleUpdate(r.id, { is_admin: !r.is_admin })}
                      >
                        <Switch
                          checked={r.is_admin}
                          onChange={(checked) => handleRoleUpdate(r.id, { is_admin: checked })}
                        />
                        Administrador
                      </label>
                      {r.tipo === 'secundario' && (
                        <label
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleRoleUpdate(r.id, { show_on_card: !r.show_on_card })}
                          title="Usado quando o membro não escolheu um subcargo no próprio perfil: aparece no card o mais alto marcado aqui. No perfil aparecem todos."
                        >
                          <Switch
                            checked={r.show_on_card}
                            onChange={(checked) => handleRoleUpdate(r.id, { show_on_card: checked })}
                          />
                          Aparecer no card
                        </label>
                      )}
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleRoleUpdate(r.id, { is_streamer: !r.is_streamer })}
                        title="Quem tem esse cargo aparece na aba Streamers (as plataformas são marcadas em Membros)."
                      >
                        <Switch
                          checked={r.is_streamer}
                          onChange={(checked) => handleRoleUpdate(r.id, { is_streamer: checked })}
                        />
                        Streamer
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.78rem] text-ink-dim mb-2">
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleRoleUpdate(r.id, { can_post_photos: !r.can_post_photos })}
                      >
                        <Switch
                          checked={r.can_post_photos}
                          onChange={(checked) => handleRoleUpdate(r.id, { can_post_photos: checked })}
                        />
                        Postar fotos
                      </label>
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleRoleUpdate(r.id, { can_delete_photos: !r.can_delete_photos })}
                      >
                        <Switch
                          checked={r.can_delete_photos}
                          onChange={(checked) => handleRoleUpdate(r.id, { can_delete_photos: checked })}
                        />
                        Apagar fotos
                      </label>
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleRoleUpdate(r.id, { can_post_announcements: !r.can_post_announcements })}
                      >
                        <Switch
                          checked={r.can_post_announcements}
                          onChange={(checked) => handleRoleUpdate(r.id, { can_post_announcements: checked })}
                        />
                        Postar anúncios
                      </label>
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleRoleUpdate(r.id, { can_delete_announcements: !r.can_delete_announcements })}
                      >
                        <Switch
                          checked={r.can_delete_announcements}
                          onChange={(checked) => handleRoleUpdate(r.id, { can_delete_announcements: checked })}
                        />
                        Apagar anúncios
                      </label>
                    </div>

                    {discordRoles && (
                      <label className="flex items-center gap-2 text-[0.78rem] text-ink-dim">
                        <span className="shrink-0">Cor do Discord:</span>
                        <select
                          value={r.discord_role_id || ''}
                          onChange={(e) => handleDiscordLink(r.id, e.target.value)}
                          className={cn(selectClass, 'flex-1 min-w-0 text-[0.78rem] py-1')}
                        >
                          <option value="">Definir na mão</option>
                          {discordRoles.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                              {d.color ? ` (${d.color})` : ' (sem cor)'}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          'text-[0.85rem] min-h-[1.2em] text-ink-dim',
          msgKind === 'error' && 'text-brand',
          msgKind === 'success' && 'text-[#3ddc84]',
        )}
      >
        {msg}
      </div>
    </div>
  );
}
