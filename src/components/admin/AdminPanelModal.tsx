import { useState, type FormEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Btn } from '@/components/layout/Btn';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import { useProfiles } from '@/hooks/useProfiles';
import { useConfirm } from '@/hooks/useConfirm';

const selectClass = 'font-body bg-panel border border-line text-ink px-2.5 py-1.5 text-[0.85rem]';

export function AdminPanelModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, refreshProfile } = useAuth();
  const { roles, reload: reloadRoles } = useRoles();
  const { profiles, reload: reloadProfiles } = useProfiles();
  const confirm = useConfirm();

  const [roleName, setRoleName] = useState('');
  const [roleOrder, setRoleOrder] = useState('');
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'' | 'error' | 'success'>('');

  async function handleAddRole(e: FormEvent) {
    e.preventDefault();
    const order = parseInt(roleOrder, 10);
    const { error } = await supabase.from('roles').insert({ name: roleName.trim(), sort_order: order });
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setRoleName('');
    setRoleOrder('');
    setMsgKind('success');
    setMsg('Cargo criado.');
    reloadRoles();
    reloadProfiles();
  }

  async function handleDeleteRole(id: string) {
    if (!(await confirm('Excluir esse cargo? Membros com ele ficam sem cargo.'))) return;
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    reloadRoles();
    reloadProfiles();
  }

  async function handleRoleChange(memberId: string, roleId: string) {
    const { error } = await supabase.from('member_profiles').update({ role_id: roleId || null }).eq('id', memberId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    setMsgKind('success');
    setMsg('Cargo atualizado.');
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
              <div key={r.id} className="flex items-center gap-2.5 bg-panel-2 border border-line px-3 py-2.5 text-[0.9rem]">
                <span className="flex-1 text-ink font-semibold">{r.name}</span>
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
            ))}
          </div>
          <form className="flex gap-2 flex-wrap" onSubmit={handleAddRole}>
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
                <select
                  className={selectClass}
                  value={p.role_id || ''}
                  onChange={(e) => handleRoleChange(p.id, e.target.value)}
                >
                  <option value="">Sem cargo</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
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
