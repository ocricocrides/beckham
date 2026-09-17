import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePresence } from '@/context/PresenceContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useRoles } from '@/hooks/useRoles';
import { useStreamPlatforms, type StreamPlatform } from '@/hooks/useStreamPlatforms';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';
import { logDiscordAction } from '@/lib/discordLog';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { MemberEditModal, type MemberPermissionColumn } from '@/components/admin/MemberEditModal';
import type { MemberProfileWithRoles } from '@/lib/supabase';

/** Marca (@menção real) o membro se a conta dele tiver Discord vinculado, senão cai pro @username. */
function marcarMembro(membro: MemberProfileWithRoles | undefined, fallbackId: string) {
  if (membro?.discord_id) return `<@${membro.discord_id}>`;
  return `@${membro?.username ?? fallbackId}`;
}

export default function AdminMembrosPage() {
  usePageMeta('Membros // Painel ADM', 'Gestão dos cargos e permissões de cada membro da BECKHAM.');

  const { user, refreshProfile } = useAuth();
  const { onlineIds } = usePresence();
  const { profiles, reload: reloadProfiles } = useProfiles({ includePending: true });
  const { roles } = useRoles();
  const { byMember: platformsByMember, reload: reloadPlatforms } = useStreamPlatforms();
  const confirm = useConfirm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'' | 'error' | 'success'>('');

  async function handleToggleRole(memberId: string, roleId: string, checked: boolean) {
    const { error } = checked
      ? await supabase.from('member_roles').insert({ member_id: memberId, role_id: roleId })
      : await supabase.from('member_roles').delete().eq('member_id', memberId).eq('role_id', roleId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    reloadProfiles();
  }

  async function handlePlatformToggle(memberId: string, platform: StreamPlatform, checked: boolean) {
    const { error } = checked
      ? await supabase.from('member_stream_platforms').insert({ member_id: memberId, platform })
      : await supabase.from('member_stream_platforms').delete().eq('member_id', memberId).eq('platform', platform);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    reloadPlatforms();
  }

  async function handleAdminToggle(memberId: string, checked: boolean) {
    const { error } = await supabase.from('member_profiles').update({ is_admin: checked }).eq('id', memberId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    reloadProfiles();
    if (memberId === user?.id) refreshProfile();
  }

  async function handlePermissionToggle(memberId: string, column: MemberPermissionColumn, checked: boolean) {
    const patch: Partial<Record<MemberPermissionColumn, boolean>> = { [column]: checked };
    const { error } = await supabase.from('member_profiles').update(patch).eq('id', memberId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    reloadProfiles();
    if (memberId === user?.id) refreshProfile();
  }

  async function handleRemoveAvatar(memberId: string) {
    if (!(await confirm('Remover a foto de perfil desse membro?'))) return;
    const { error } = await supabase.from('member_profiles').update({ avatar_url: null }).eq('id', memberId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    reloadProfiles();
    if (memberId === user?.id) refreshProfile();
  }

  async function handleRenameDisplayName(memberId: string, newName: string) {
    const membro = profiles?.find((p) => p.id === memberId);
    const { error } = await supabase.from('member_profiles').update({ display_name: newName }).eq('id', memberId);
    if (error) {
      setMsgKind('error');
      setMsg('Erro: ' + error.message);
      return;
    }
    reloadProfiles();
    if (memberId === user?.id) refreshProfile();
    setMsgKind('success');
    setMsg('Nome atualizado.');
    logDiscordAction('rename_profile', `${marcarMembro(membro, memberId)} → ${newName}`);
  }

  async function handleDeleteAccount(memberId: string) {
    const membro = profiles?.find((p) => p.id === memberId);
    if (
      !(await confirm(
        `Excluir a conta de @${membro?.username ?? memberId} por completo? Isso apaga o login dela e não dá pra desfazer.`,
      ))
    )
      return;

    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    try {
      const r = await fetch('/api/delete-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ memberId }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || 'Falha ao excluir a conta.');
    } catch (e) {
      setMsgKind('error');
      setMsg('Erro: ' + (e as Error).message);
      return;
    }

    setEditingId(null);
    reloadProfiles();
    setMsgKind('success');
    setMsg('Conta excluída.');
    logDiscordAction('delete_profile', marcarMembro(membro, memberId));
  }

  const editing: MemberProfileWithRoles | null = profiles?.find((p) => p.id === editingId) ?? null;

  return (
    <div>
      <h4 className="text-ink text-[1rem] tracking-wide mb-1">Membros</h4>
      <p className="text-ink-dim text-[0.78rem] mb-5">
        Clique num membro pra ver/editar os cargos dele. A bolinha verde é quem está com o site aberto agora.
      </p>

      {!profiles?.length ? (
        <p className="text-ink-dim text-[0.85rem]">Carregando membros…</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
          {profiles.map((p) => {
            const online = onlineIds.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setEditingId(p.id)}
                className="relative flex flex-col items-center gap-2 bg-panel-2 border border-line px-3 py-4 hover:border-brand transition-colors text-center"
              >
                <span className="relative w-11 h-11 shrink-0">
                  <span className="block w-full h-full rounded-full overflow-hidden bg-[#1c1c1f]">
                    <img src={p.avatar_url || DEFAULT_AVATAR} alt="" className="w-full h-full object-cover" />
                  </span>
                  {online && (
                    <span
                      title="Online agora"
                      className="absolute bottom-0 right-0 z-10 w-3 h-3 rounded-full bg-[#3ddc84] border-2 border-panel-2"
                    />
                  )}
                </span>
                <span className="text-ink text-[0.82rem] font-semibold truncate w-full">
                  {p.display_name || p.username}
                </span>
                {!p.is_member && <span className="text-brand text-[0.7rem] font-bold tracking-wide">Sem registro</span>}
              </button>
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

      <MemberEditModal
        member={editing}
        roles={roles}
        currentUserId={user?.id}
        onOpenChange={(open) => !open && setEditingId(null)}
        onToggleRole={handleToggleRole}
        onToggleAdmin={handleAdminToggle}
        onTogglePermission={handlePermissionToggle}
        onRemoveAvatar={handleRemoveAvatar}
        onRenameDisplayName={handleRenameDisplayName}
        onDeleteAccount={handleDeleteAccount}
        platforms={editing ? (platformsByMember.get(editing.id) ?? []) : []}
        onTogglePlatform={handlePlatformToggle}
      />
    </div>
  );
}
