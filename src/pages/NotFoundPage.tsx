import { useNavigate } from 'react-router-dom';
import { Wrap } from '@/components/layout/Wrap';
import { Btn } from '@/components/layout/Btn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Página não encontrada');
  const navigate = useNavigate();

  return (
    <Wrap>
      <div className="py-24 text-center">
        <h1 className="font-display text-4xl text-brand mb-4">404</h1>
        <p className="text-ink-dim mb-8">Essa página não existe.</p>
        <Btn variant="outline" onClick={() => navigate('/')}>
          Voltar ao início
        </Btn>
      </div>
    </Wrap>
  );
}
