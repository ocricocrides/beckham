import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfileEditorModal } from '@/components/profile/ProfileEditorModal';
import { Btn } from '@/components/layout/Btn';

export function AccountsBar() {
  const { user, profile, isMember } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className="mt-7 flex items-center justify-between gap-3.5 flex-wrap pb-7 border-b border-line">
      {!user ? (
        <div>
          <Btn variant="outline" onClick={() => setAuthOpen(true)}>
            Entrar / Criar conta
          </Btn>
        </div>
      ) : (
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="text-brand font-bold font-display text-[0.85rem]">
            @{profile?.username ?? '...'}
          </span>
          {isMember ? (
            <Btn variant="outline" onClick={() => setEditorOpen(true)}>
              Meu Perfil
            </Btn>
          ) : (
            <Btn variant="primary" onClick={() => navigate('/registro')}>
              Finalizar registro
            </Btn>
          )}
        </div>
      )}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <ProfileEditorModal open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  );
}
