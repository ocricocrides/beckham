import { Link } from 'react-router-dom';
import { Wrap } from '@/components/layout/Wrap';

export default function NotFoundPage() {
  return (
    <Wrap>
      <div className="py-24 text-center">
        <h1 className="font-display text-4xl text-brand mb-4">404</h1>
        <p className="text-ink-dim mb-8">Essa página não existe.</p>
        <Link to="/" className="btn btn-outline clip-corner-sm border border-line px-6 py-3 text-ink">
          Voltar ao início
        </Link>
      </div>
    </Wrap>
  );
}
