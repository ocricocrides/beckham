import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Btn } from '@/components/layout/Btn';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import { useDiscordRoles, type DiscordRole } from '@/hooks/useDiscordRoles';
import { useProfiles } from '@/hooks/useProfiles';
import { useConfirm } from '@/hooks/useConfirm';
import { ColorPicker } from '@/components/ui/color-picker';
import { RoleMultiSelect } from './RoleMultiSelect';

const selectClass = 'font-body bg-panel border border-line text-ink px-2.5 py-1.5 text-[0.85rem]';

/** Mesmo vermelho do tema (tailwind.config.ts). Cargo sem cor definida cai nele. */
const BRAND_RED = '#ff1633';

export function AdminPanelModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, refreshProfile } = useAuth();
  const { roles, reload: reloadRoles } = useRoles();
  const { discordRoles, error: discordError, loading: discordLoading, reload: reloadDiscord } =
    useDiscordRoles(open);
  const { profiles, reload: reloadProfiles } = useProfiles();
  const confirm = useConfirm();

  const [roleName, setRoleName] = useState('');
  const [roleOrder, setRoleOrder] = useState('');
  const [roleColor, setRoleColor] = useState(BRAND_RED);

  // Cores já aplicadas em outros cargos, oferecidas como atalho dentro do seletor.
  const coresEmUso = Array.from(
    new Set(roles.map((r) => r.color).filter((c): c is string => !!c)),
  );
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'' | 'error' | 'success'>('');

  async function handleAddRole(e: FormEvent) {
    e.preventDefault();
    const order = parseInt(roleOrder, 10);
    const { error } = await supabase
      .from('roles')
      .insert({ name: roleName.trim(), sort_order: order, color: roleColor });
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setRoleName('');
    setRoleOrder('');
    setRoleColor(BRAND_RED);
    setMsgKind('success');
    setMsg('Cargo criado.');
    reloadRoles();
    reloadProfiles();
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
    reloadProfiles();
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
    reloadProfiles();
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
      reloadProfiles();
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

  // Sincronização automática: toda vez que o painel abre e os cargos do Discord chegam,
  // as cores vinculadas são conferidas em silêncio. Só avisa na tela se algo mudou.
  const autoSyncFeito = useRef(false);
  useEffect(() => {
    if (!open) {
      autoSyncFeito.current = false;
      return;
    }
    if (autoSyncFeito.current || !discordRoles || roles.length === 0) return;
    autoSyncFeito.current = true;
    aplicarCoresDoDiscord(discordRoles).then(({ mudou }) => {
      if (mudou > 0) {
        setMsgKind('success');
        setMsg(`${mudou} cor(es) sincronizada(s) do Discord.`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, discordRoles, roles]);

  async function handleDeleteRole(id: string) {
    if (!(await confirm('Excluir esse cargo? Membros com ele ficam sem esse cargo.'))) return;
    // Guardado antes de excluir: depois de apagado, member_roles já não sabe quem tinha o quê.
    const afetados = (profiles ?? []).filter((p) => p.roles.some((r) => r.id === id));
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    // Recalcula o cargo principal (espelho em role_id) de quem ficou com outros cargos.
    for (const p of afetados) {
      const restantes = p.roles.filter((r) => r.id !== id).sort((a, b) => a.sort_order - b.sort_order);
      await supabase.from('member_profiles').update({ role_id: restantes[0]?.id ?? null }).eq('id', p.id);
    }
    reloadRoles();
    reloadProfiles();
  }

  /**
   * Um membro pode ter vários cargos agora (tabela member_roles). A coluna antiga
   * member_profiles.role_id continua espelhando o cargo mais alto na hierarquia
   * (menor sort_order) pra quem ainda lê só ela (ex: o bot do Discord).
   */
  async function handleToggleRole(memberId: string, roleId: string, checked: boolean) {
    const { error } = checked
      ? await supabase.from('member_roles').insert({ member_id: memberId, role_id: roleId })
      : await supabase.from('member_roles').delete().eq('member_id', memberId).eq('role_id', roleId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }

    const membro = profiles?.find((p) => p.id === memberId);
    const idsAtuais = new Set((membro?.roles ?? []).map((r) => r.id));
    if (checked) idsAtuais.add(roleId);
    else idsAtuais.delete(roleId);
    const principal = roles
      .filter((r) => idsAtuais.has(r.id))
      .sort((a, b) => a.sort_order - b.sort_order)[0];
    await supabase.from('member_profiles').update({ role_id: principal?.id ?? null }).eq('id', memberId);

    setMsgKind('success');
    setMsg('Cargos atualizados.');
    reloadProfiles();
  }

  async function handleAdminToggle(memberId: string, checked: boolean) {
    const { error } = await supabase.from('member_profiles').update({ is_admin: checked }).eq('id', memberId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setMsgKind('success');
    setMsg('Permissões atualizadas.');
    if (memberId === user?.id) refreshProfile();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel border border-transparent rounded-none p-0 max-w-[560px] max-h-[88vh] flex flex-col overflow-hidden text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand">
        <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-line transform-gpu" />
        <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-line transform-gpu" />
        <div className="min-h-0 flex-1 overflow-y-auto p-9">
        <h3 className="text-[1.4rem] mb-5 text-ink">Painel ADM</h3>

        <div className="mb-7">
          <h4 className="text-ink text-[1rem] tracking-wide mb-3">Cargos</h4>
          <div className="flex flex-col gap-2 mb-3.5">
            {roles.length === 0 && <p className="text-ink-dim text-[0.85rem]">Nenhum cargo criado ainda.</p>}
            {roles.map((r) => (
              <div key={r.id} className="bg-panel-2 border border-line px-3 py-2.5 text-[0.9rem]">
                <div className="flex items-center gap-2.5">
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
                  <span className="flex-1 font-semibold" style={{ color: r.color || BRAND_RED }}>
                    {r.name}
                  </span>
                  <span className="text-ink-dim text-[0.78rem]">ordem {r.sort_order}</span>
                  <button
                    type="button"
                    title="Excluir cargo"
                    onClick={() => handleDeleteRole(r.id)}
                    className="bg-none border-none text-ink-dim hover:text-brand cursor-pointer text-[1.1rem] leading-none px-1.5 py-0.5"
                  >
                    ×
                  </button>
                </div>
                {discordRoles && (
                  <label className="mt-2 flex items-center gap-2 text-[0.78rem] text-ink-dim">
                    <span className="shrink-0">Cor do Discord:</span>
                    <select
                      value={r.discord_role_id || ''}
                      onChange={(e) => handleDiscordLink(r.id, e.target.value)}
                      className={cn(selectClass, 'flex-1 min-w-0 text-[0.78rem] py-1')}
                    >
                      <option value="">— definir na mão —</option>
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
            ))}
          </div>

          <div className="mb-3.5 text-[0.78rem]">
            {discordLoading && <span className="text-ink-dim">Lendo os cargos do Discord…</span>}
            {discordError && (
              <span className="text-brand">Discord indisponível: {discordError}</span>
            )}
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

          <form className="flex gap-2 flex-wrap" onSubmit={handleAddRole}>
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
              className={cn(selectClass, 'w-[90px]')}
            />
            <Btn type="submit" variant="primary">
              Adicionar
            </Btn>
          </form>
        </div>

        <div className="mb-7">
          <h4 className="text-ink text-[1rem] tracking-wide mb-3">Membros</h4>
          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
            {profiles?.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 flex-wrap bg-panel-2 border border-line px-3 py-2.5 text-[0.85rem]">
                <span className="flex-1 min-w-[100px] text-ink font-semibold">@{p.username}</span>
                <RoleMultiSelect
                  roles={roles}
                  selectedIds={new Set(p.roles.map((r) => r.id))}
                  onToggle={(roleId, checked) => handleToggleRole(p.id, roleId, checked)}
                />
                <label className="flex items-center gap-1.5 text-ink-dim text-[0.78rem]">
                  <input
                    type="checkbox"
                    checked={!!p.is_admin}
                    onChange={(e) => handleAdminToggle(p.id, e.target.checked)}
                  />
                  ADM
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={cn('text-[0.85rem] min-h-[1.2em] text-ink-dim', msgKind === 'error' && 'text-brand', msgKind === 'success' && 'text-[#3ddc84]')}>
          {msg}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
