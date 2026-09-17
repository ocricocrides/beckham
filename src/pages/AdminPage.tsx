import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Wrap, SectionHead } from '@/components/layout/Wrap';
import { cn } from '@/lib/utils';

const ADMIN_TABS = [
  { to: '/admin', label: 'Início', end: true },
  { to: '/admin/membros', label: 'Membros' },
  { to: '/admin/cargos', label: 'Cargos' },
  { to: '/admin/destaques', label: 'Destaques' },
] as const;

/**
 * Layout da área restrita: guarda o acesso a quem tem is_admin e dá a estrutura de abas
 * (mesmo estilo do menu principal) pra novas seções de configuração entrarem aqui com o tempo.
 */
export default function AdminPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Wrap>
      <SectionHead title="Painel ADM" description="Área restrita a administradores da BECKHAM." />

      <nav className="flex gap-1.5 mt-8 flex-wrap">
        {ADMIN_TABS.map((tab) => (
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
