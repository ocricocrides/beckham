import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { HeroBg } from './HeroBg';

export function Layout() {
  const location = useLocation();

  return (
    <>
      <HeroBg />
      <Header />
      <main className="relative z-[1]" style={{ paddingTop: 78, paddingBottom: 'var(--footer-h, 90px)' }}>
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}
