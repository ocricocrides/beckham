import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { HeroBg } from './HeroBg';

export function Layout() {
  const location = useLocation();

  return (
    // Coluna de altura de tela: o main cresce e empurra o rodape pro fim sozinho.
    // Com header sticky (no fluxo) e rodape no fim, nenhuma barra precisa saber a
    // altura da outra - era isso que exigia o paddingTop de 78 e a var --footer-h.
    <div className="min-h-[100dvh] flex flex-col">
      <HeroBg />
      <Header />
      <main className="relative z-[1] flex-1 flex flex-col">
        <div key={location.pathname} className="animate-fade-in flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
