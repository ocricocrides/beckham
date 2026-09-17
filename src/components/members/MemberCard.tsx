import type { MemberProfileWithRoles } from '@/lib/supabase';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { BrandCard } from '@/components/glow-card/BrandCard';

export function MemberCard({ profile, onClick }: { profile: MemberProfileWithRoles; onClick: () => void }) {
  // No card vai só o principal + UM subcargo: o que o membro escolheu no "Meu Perfil" (se ele
  // ainda tiver esse cargo) ou, sem escolha, o mais alto marcado "aparecer no card" pela ADM
  // (roles já vem ordenado por sort_order). Todos os cargos aparecem no perfil completo.
  const principal = profile.roles.find((r) => r.tipo === 'principal');
  const secundarios = profile.roles.filter((r) => r.tipo === 'secundario');
  const escolhido = secundarios.find((r) => r.id === profile.card_role_id);
  const secundariosNoCard = escolhido ? [escolhido] : secundarios.filter((r) => r.show_on_card).slice(0, 1);

  return (
    <BrandCard className="cursor-pointer" onClick={onClick}>

      <div className="p-[26px_22px]">
        <div className="relative w-[52px] h-[52px] mb-4 rounded-full ring-2 ring-transparent transition-all duration-300 group-hover:ring-brand overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center grayscale transition-all duration-300 group-hover:grayscale-0"
            style={{
              backgroundImage: `url('${profile.avatar_url || DEFAULT_AVATAR}')`,
              backgroundColor: '#1c1c1f',
            }}
          />
        </div>
        <h4 className="text-ink text-[1.05rem] font-semibold">{profile.display_name || profile.username}</h4>
        {(principal || secundariosNoCard.length > 0) && (
          <div className="my-1.5">
            {principal && (
              <div
                className="text-brand text-[0.78rem] font-bold tracking-wide"
                style={principal.color ? { color: principal.color } : undefined}
              >
                {principal.name.toUpperCase()}
              </div>
            )}
            {secundariosNoCard.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                {secundariosNoCard.map((r) => (
                  <span
                    key={r.id}
                    className="text-ink-dim text-[0.7rem] font-semibold tracking-wide"
                    style={r.color ? { color: r.color } : undefined}
                  >
                    {r.name.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="text-ink-dim text-[0.88rem] leading-[1.5]">{profile.bio}</p>
      </div>
    </BrandCard>
  );
}
