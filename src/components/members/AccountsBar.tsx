import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Btn } from '@/components/layout/Btn';

export function AccountsBar({
  onOpenEditor,
  onOpenAdmin,
}: {
  onOpenEditor?: () => void;
  onOpenAdmin?: () => void;
}) {
  const { user, profile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

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
          <Btn variant="outline" onClick={onOpenEditor}>
            Meu Perfil
          </Btn>
          {profile?.is_admin && (
            <Btn variant="outline" onClick={onOpenAdmin}>
              Painel ADM
            </Btn>
          )}
        </div>
      )}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
