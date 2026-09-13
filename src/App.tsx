import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import InicioPage from '@/pages/InicioPage';
import MembrosPage from '@/pages/MembrosPage';
import FotosPage from '@/pages/FotosPage';
import NoticiasPage from '@/pages/NoticiasPage';
import RankingPage from '@/pages/RankingPage';
import HistoriaPage from '@/pages/HistoriaPage';
import PerfilPage from '@/pages/PerfilPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
