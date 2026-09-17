import type { FormEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Btn } from '@/components/layout/Btn';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_AVATAR } from '@/lib/constants';
import {
  STREAM_PLATFORMS,
  STREAM_PLATFORM_LABEL,
  STREAM_PLATFORM_URL_COLUMN,
  type StreamPlatform,
} from '@/hooks/useStreamPlatforms';
import type { MemberProfileWithRoles, Role } from '@/lib/supabase';

export type MemberPermissionColumn =
  | 'can_post_photos'
  | 'can_delete_photos'
  | 'can_post_announcements'
  | 'can_delete_announcements'
  | 'can_review_registrations';

const PERMISSION_LABELS: Record<MemberPermissionColumn, string> = {
  can_post_photos: 'Pode postar fotos',
  can_delete_photos: 'Pode apagar fotos',
  can_post_announcements: 'Pode postar anúncios',
  can_delete_announcements: 'Pode apagar anúncios',
  can_review_registrations: 'Pode aprovar registros',
};

export function MemberEditModal({
  member,
  roles,
  currentUserId,
  onOpenChange,
  onToggleRole,
  onToggleAdmin,
  onTogglePermission,
  onRemoveAvatar,
  onRenameDisplayName,
  onDeleteAccount,
  platforms,
  onTogglePlatform,
}: {
  member: MemberProfileWithRoles | null;
  roles: Role[];
  /** Pra esconder "Excluir conta" quando o membro aberto é o próprio admin logado. */
  currentUserId: string | undefined;
  onOpenChange: (open: boolean) => void;
  onToggleRole: (memberId: string, roleId: string, checked: boolean) => void;
  onToggleAdmin: (memberId: string, checked: boolean) => void;
  onTogglePermission: (memberId: string, column: MemberPermissionColumn, checked: boolean) => void;
  onRemoveAvatar: (memberId: string) => void;
  onRenameDisplayName: (memberId: string, newName: string) => void;
  onDeleteAccount: (memberId: string) => void;
  /** Plataformas em que o membro transmite (só aparece se ele tiver algum cargo de streamer). */
  platforms: StreamPlatform[];
  onTogglePlatform: (memberId: string, platform: StreamPlatform, checked: boolean) => void;
}) {
  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel border border-transparent rounded-none p-0 max-w-[420px] max-h-[85vh] flex flex-col overflow-hidden text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand">
        <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-line transform-gpu" />
        <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-line transform-gpu" />
        {member && (
          <div className="min-h-0 flex-1 overflow-y-auto p-7">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={member.avatar_url || DEFAULT_AVATAR}
                alt=""
                className="w-14 h-14 rounded-full object-cover bg-[#1c1c1f] shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-[1.2rem] text-ink truncate">@{member.username}</h3>
                <p className="text-ink-dim text-[0.8rem] truncate">{member.display_name}</p>
              </div>
            </div>

            {member.avatar_url && (
              <button
                type="button"
                onClick={() => onRemoveAvatar(member.id)}
                className="mb-5 text-brand text-[0.78rem] hover:underline"
              >
                Remover foto de perfil
              </button>
            )}

            <div className="mb-5 pb-5 border-b border-line">
              <div className="text-ink-dim text-[0.78rem] font-bold tracking-wide uppercase mb-2">
                Nome de exibição
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('displayName') as HTMLInputElement;
                  const value = input.value.trim();
                  if (value && value !== member.display_name) onRenameDisplayName(member.id, value);
                }}
              >
                <input
                  key={member.id}
                  name="displayName"
                  defaultValue={member.display_name}
                  maxLength={40}
                  required
                  className="flex-1 min-w-0 bg-panel border border-line text-ink px-2.5 py-1.5 text-[0.85rem]"
                />
                <Btn type="submit" variant="outline">
                  Salvar
                </Btn>
              </form>
            </div>

            <label className="flex items-center gap-2 text-ink text-[0.85rem] mb-3">
              <input
                type="checkbox"
                checked={!!member.is_admin}
                onChange={(e) => onToggleAdmin(member.id, e.target.checked)}
              />
              Administrador (manual, independente do cargo)
            </label>

            <div className="flex flex-col gap-2 mb-5 pb-5 border-b border-line">
              {(Object.keys(PERMISSION_LABELS) as MemberPermissionColumn[]).map((column) => (
                <label key={column} className="flex items-center gap-2 text-ink text-[0.85rem]">
                  <input
                    type="checkbox"
                    checked={!!member[column]}
                    onChange={(e) => onTogglePermission(member.id, column, e.target.checked)}
                  />
                  {PERMISSION_LABELS[column]} (manual, soma com o cargo)
                </label>
              ))}
            </div>

            <div className="text-ink-dim text-[0.78rem] font-bold tracking-wide uppercase mb-2.5">Cargos</div>
            {roles.length === 0 && <p className="text-ink-dim text-[0.85rem]">Nenhum cargo criado ainda.</p>}
            <div className="flex flex-col gap-1">
              {roles.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-2.5 px-1.5 py-1.5 text-[0.85rem] text-ink hover:bg-panel-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={member.roles.some((mr) => mr.id === r.id)}
                    onChange={(e) => onToggleRole(member.id, r.id, e.target.checked)}
                  />
                  <span className="flex-1 truncate" style={r.color ? { color: r.color } : undefined}>
                    {r.name}
                  </span>
                  {r.tipo === 'principal' && (
                    <span className="text-ink-dim text-[0.68rem] uppercase tracking-wide">principal</span>
                  )}
                </label>
              ))}
            </div>

            {member.roles.some((r) => r.is_streamer) && (
              <div className="mt-5 pt-5 border-t border-line">
                <div className="text-ink-dim text-[0.78rem] font-bold tracking-wide uppercase mb-1">
                  Plataformas de streamer
                </div>
                <p className="text-ink-dim text-[0.7rem] mb-2.5">
                  Define em quais abas da página Streamers ele aparece. O link vem do perfil dele.
                </p>
                <div className="flex flex-col gap-2">
                  {STREAM_PLATFORMS.map((platform) => {
                    const checked = platforms.includes(platform);
                    const semLink = !member[STREAM_PLATFORM_URL_COLUMN[platform]];
                    return (
                      <label
                        key={platform}
                        className="flex items-center gap-2.5 text-ink text-[0.85rem] cursor-pointer"
                        onClick={() => onTogglePlatform(member.id, platform, !checked)}
                      >
                        <Switch checked={checked} onChange={(v) => onTogglePlatform(member.id, platform, v)} />
                        {STREAM_PLATFORM_LABEL[platform]}
                        {checked && semLink && (
                          <span className="text-brand text-[0.7rem]">sem link no perfil, não vai aparecer</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {member.id !== currentUserId && (
              <div className="mt-6 pt-5 border-t border-line">
                <button
                  type="button"
                  onClick={() => onDeleteAccount(member.id)}
                  className="text-brand text-[0.85rem] font-semibold hover:underline"
                >
                  Excluir conta
                </button>
                <p className="text-ink-dim text-[0.7rem] mt-1">
                  Apaga o login da pessoa por completo (não só o perfil). Não dá pra desfazer.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
