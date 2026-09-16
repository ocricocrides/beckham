import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import InicioPage from '@/pages/InicioPage';
import MembrosPage from '@/pages/MembrosPage';
import FotosPage from '@/pages/FotosPage';
import NoticiasPage from '@/pages/NoticiasPage';
import RankingPage from '@/pages/RankingPage';
import HistoriaPage from '@/pages/HistoriaPage';
import PerfilPage from '@/pages/PerfilPage';
import AdminPage from '@/pages/AdminPage';
import AdminInicioPage from '@/pages/AdminInicioPage';
import AdminMembrosPage from '@/pages/AdminMembrosPage';
import AdminCargosPage from '@/pages/AdminCargosPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  const navigate = useNavigate();

  // Shim: a rota /perfil/:username antiga (via api/perfil/[username].js, que serve tags OG
  // pros crawlers) redireciona navegadores reais pra /#perfil/{username}. Aqui a gente pega
  // esse hash uma vez no boot e entra na rota de verdade do react-router.
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash.startsWith('perfil/')) {
      navigate(`/${hash}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<InicioPage />} />
        <Route path="membros" element={<MembrosPage />} />
        <Route path="fotos" element={<FotosPage />} />
        <Route path="noticias" element={<NoticiasPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="historia" element={<HistoriaPage />} />
        <Route path="perfil/:username" element={<PerfilPage />} />
        <Route path="admin" element={<AdminPage />}>
          <Route index element={<AdminInicioPage />} />
          <Route path="membros" element={<AdminMembrosPage />} />
          <Route path="cargos" element={<AdminCargosPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
