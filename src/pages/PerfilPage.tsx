import { useParams } from 'react-router-dom';
import { ComingSoon } from '@/components/layout/ComingSoon';

export default function PerfilPage() {
  const { username } = useParams();
  return (
    <ComingSoon
      title={`Perfil: ${username}`}
      description="A página pública de biolink chega na Etapa 5."
    />
  );
}
