import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/supabase';

export function RoleMultiSelect({
  roles,
  selectedIds,
  onToggle,
}: {
  roles: Role[];
  selectedIds: Set<string>;
  onToggle: (roleId: string, checked: boolean) => void;
}) {
  const selecionados = roles.filter((r) => selectedIds.has(r.id));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="font-body bg-panel border border-line text-ink px-2.5 py-1.5 text-[0.85rem] text-left flex-1 min-w-[140px] max-w-[220px] truncate"
        >
          {selecionados.length === 0 ? (
            <span className="text-ink-dim">Sem cargo</span>
          ) : (
            selecionados.map((r) => r.name).join(', ')
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          collisionPadding={12}
          // Precisa ficar acima do DialogContent do painel ADM, que é z-[1001].
          className="z-[1100] w-[220px] max-h-[260px] overflow-y-auto bg-panel border border-line p-1.5 shadow-2xl"
        >
          {roles.length === 0 && (
            <p className="text-ink-dim text-[0.8rem] px-1.5 py-1.5">Nenhum cargo criado ainda.</p>
          )}
          {roles.map((r) => (
            <label
              key={r.id}
              className={cn(
                'flex items-center gap-2 px-1.5 py-1.5 text-[0.85rem] text-ink cursor-pointer',
                'hover:bg-panel-2',
              )}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(r.id)}
                onChange={(e) => onToggle(r.id, e.target.checked)}
              />
              <span className="flex-1 truncate" style={r.color ? { color: r.color } : undefined}>
                {r.name}
              </span>
            </label>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
