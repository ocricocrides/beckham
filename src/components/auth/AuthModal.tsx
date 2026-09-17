import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormField, inputClass } from '@/components/layout/FormField';
import { Btn } from '@/components/layout/Btn';
import { cn } from '@/lib/utils';
import { supabase, usernameToEmail } from '@/lib/supabase';

type Tab = 'login' | 'signup';
type MsgKind = '' | 'error' | 'success';

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [tab, setTab] = useState<Tab>('login');
  const navigate = useNavigate();

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [loginMsgKind, setLoginMsgKind] = useState<MsgKind>('');
  const [loginBusy, setLoginBusy] = useState(false);

  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupMsg, setSignupMsg] = useState('');
  const [signupMsgKind, setSignupMsgKind] = useState<MsgKind>('');
  const [signupBusy, setSignupBusy] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginBusy(true);
    setLoginMsgKind('');
    setLoginMsg('Entrando...');
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(loginUsername),
      password: loginPassword,
    });
    setLoginBusy(false);
    if (error) {
      setLoginMsg('Usuário ou senha inválidos.');
      setLoginMsgKind('error');
      return;
    }
    setLoginMsg('');
    onOpenChange(false);
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setSignupBusy(true);
    setSignupMsgKind('');
    setSignupMsg('Criando conta...');
    const username = signupUsername.trim().toLowerCase();
    const { error: fnError } = await supabase.functions.invoke('signup', {
      body: { username, password: signupPassword },
    });
    if (fnError) {
      let text = fnError.message;
      const context = (fnError as unknown as { context?: { json?: () => Promise<{ error?: string }> } }).context;
      if (context?.json) {
        try {
          const body = await context.json();
          if (body?.error) text = body.error;
        } catch {
          /* keep default message */
        }
      }
      setSignupMsg(text);
      setSignupMsgKind('error');
      setSignupBusy(false);
      return;
    }
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password: signupPassword,
    });
    setSignupBusy(false);
    if (loginError) {
      setSignupMsg('Conta criada! Faça login.');
      setSignupMsgKind('success');
      return;
    }
    setSignupMsg('');
    onOpenChange(false);
    // Conta nova ainda não é de membro: segue direto pro vínculo com o Discord e o formulário.
    navigate('/registro');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel border border-transparent rounded-none p-9 pt-9 max-w-[420px] text-ink [&>button]:text-ink-dim [&>button]:opacity-100 [&>button:hover]:text-brand [&>button]:top-3.5 [&>button]:right-4.5">
        <span className="pointer-events-none absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-line transform-gpu" />
        <span className="pointer-events-none absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-line transform-gpu" />
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={cn(
              'flex-1 bg-none border border-line text-ink-dim py-2.5 font-bold tracking-wide cursor-pointer text-[0.85rem]',
              tab === 'login' && 'text-ink bg-brand/[0.08] border-brand',
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={cn(
              'flex-1 bg-none border border-line text-ink-dim py-2.5 font-bold tracking-wide cursor-pointer text-[0.85rem]',
              tab === 'signup' && 'text-ink bg-brand/[0.08] border-brand',
            )}
          >
            Criar conta
          </button>
        </div>

        {tab === 'login' ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <FormField label="Nome de usuário" htmlFor="loginUsername">
              <Input
                id="loginUsername"
                required
                autoComplete="username"
                className={inputClass}
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </FormField>
            <FormField label="Senha" htmlFor="loginPassword">
              <Input
                id="loginPassword"
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </FormField>
            <Btn type="submit" variant="primary" disabled={loginBusy}>
              Entrar
            </Btn>
            <div className={cn('text-[0.85rem] min-h-[1.2em] text-ink-dim', loginMsgKind === 'error' && 'text-brand', loginMsgKind === 'success' && 'text-[#3ddc84]')}>
              {loginMsg}
            </div>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSignup}>
            <FormField label="Nome de usuário (usado no link do perfil)" htmlFor="signupUsername">
              <Input
                id="signupUsername"
                required
                pattern="[a-z0-9_.]{3,20}"
                title="3-20 letras minúsculas, números, . ou _"
                placeholder="ex: rafinha"
                autoComplete="username"
                className={inputClass}
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
              />
            </FormField>
            <FormField label="Senha" htmlFor="signupPassword">
              <Input
                id="signupPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
            </FormField>
            <Btn type="submit" variant="primary" disabled={signupBusy}>
              Criar conta
            </Btn>
            <div className={cn('text-[0.85rem] min-h-[1.2em] text-ink-dim', signupMsgKind === 'error' && 'text-brand', signupMsgKind === 'success' && 'text-[#3ddc84]')}>
              {signupMsg}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
