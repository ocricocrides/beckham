import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Btn } from '@/components/layout/Btn';

interface ConfirmContextValue {
  confirm: (message: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const resolverRef = useRef<(value: boolean) => void>();

  const confirm = useCallback((msg: string) => {
    setMessage(msg);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  function close(result: boolean) {
    resolverRef.current?.(result);
    setMessage(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={message !== null} onOpenChange={(open) => !open && close(false)}>
        <DialogContent className="bg-panel border border-line rounded-none clip-corner-panel p-9 max-w-[380px] text-ink">
          <p className="text-ink-dim text-[0.95rem] leading-relaxed">{message}</p>
          <div className="flex justify-end gap-3 mt-6">
            <Btn variant="outline" onClick={() => close(false)}>
              Cancelar
            </Btn>
            <Btn variant="primary" onClick={() => close(true)}>
              Confirmar
            </Btn>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
