import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { cn } from '@/lib/utils';

/** somenteAdmin: aba que exige is_admin. As outras abrem pra quem tem a permissão específica. */
const ADMIN_TABS = [
  { to: '/admin', label: 'Início', end: true, somenteAdmin: true },
  { to: '/admin/membros', label: 'Membros', somenteAdmin: true },
  { to: '/admin/cargos', label: 'Cargos', somenteAdmin: true },
  { to: '/admin/destaques', label: 'Destaques', somenteAdmin: true },
  { to: '/admin/registros', label: 'Registros', somenteAdmin: false },
] as const;

const ABA_REGISTROS = '/admin/registros';

/**
 * Layout da área restrita: guarda o acesso e dá a estrutura de abas (mesmo estilo do menu
 * principal) pra novas seções de configuração entrarem aqui com o tempo.
 *
 * Quem é admin vê tudo. Quem só tem can_review_registrations entra no painel, mas apenas na aba
 * de registros: as outras somem do menu e o acesso direto pela URL cai de volta nela.
 */
export default function AdminPage() {
  const { isAdmin, canReview, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAdmin && !canReview) return <Navigate to="/" replace />;
  if (!isAdmin && location.pathname !== ABA_REGISTROS) return <Navigate to={ABA_REGISTROS} replace />;

  const abas = ADMIN_TABS.filter((tab) => isAdmin || !tab.somenteAdmin);

  return (
    <Wrap>
      <SectionHead
        title="Painel ADM"
        description={
          isAdmin
            ? 'Área restrita a administradores da BECKHAM.'
            : 'Área restrita. Você tem acesso à revisão de registros.'
        }
      />

      <nav className="flex gap-1.5 mt-8 flex-wrap">
        {abas.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={'end' in tab ? tab.end : false}
            className={({ isActive }) =>
              cn(
                'clip-corner-sm bg-none border border-transparent text-ink-dim text-[0.85rem] font-bold tracking-wide px-[18px] py-[9px] cursor-pointer transition-colors hover:text-ink',
                isActive && 'text-ink bg-brand/[0.08] border-line',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="py-10 border-t border-line mt-3">
        <Outlet />
      </div>
    </Wrap>
  );
}
