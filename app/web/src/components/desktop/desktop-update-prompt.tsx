'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { useDesktopUpdate } from '@/hooks/use-desktop-update';
import { typeClass } from '@/lib/typography';

export function DesktopUpdatePrompt() {
  const { state, visible, download, install, retry, dismiss } = useDesktopUpdate();

  if (!visible || !state) {
    return null;
  }

  const progress = state.progress != null ? Math.round(state.progress) : 0;

  return (
    <aside
      className={cn(
        'fixed bottom-4 right-4 z-[1100] w-[min(100vw-2rem,22rem)] rounded-xl border border-grey bg-layer1 p-4 shadow-lg',
      )}
      aria-live="polite"
      aria-label="App update available"
    >
      {state.status === 'available' ? (
        <>
          <p className={cn(typeClass.bodyStrong, 'text-text')}>
            Nova versão {state.nextVersion} disponível
          </p>
          <p className={cn(typeClass.caption, 'mt-1 text-text/70')}>
            Versão atual: {state.currentVersion}. Seus dados locais são preservados.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={() => void download()}>
              Atualizar
            </Button>
            <button
              type="button"
              className={cn(typeClass.caption, 'cursor-pointer text-text/60 underline-offset-2 hover:text-text hover:underline')}
              onClick={dismiss}
            >
              Depois
            </button>
          </div>
        </>
      ) : null}

      {state.status === 'downloading' ? (
        <>
          <p className={cn(typeClass.bodyStrong, 'text-text')}>Baixando atualização…</p>
          <p className={cn(typeClass.caption, 'mt-1 text-text/70')}>{progress}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-layer2">
            <div
              className="h-full rounded-full bg-red transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : null}

      {state.status === 'ready' ? (
        <>
          <p className={cn(typeClass.bodyStrong, 'text-text')}>Atualização pronta</p>
          <p className={cn(typeClass.caption, 'mt-1 text-text/70')}>
            Reinicie o app para concluir a instalação da versão {state.nextVersion}.
          </p>
          <div className="mt-3">
            <Button size="sm" onClick={() => void install()}>
              Reiniciar agora
            </Button>
          </div>
        </>
      ) : null}

      {state.status === 'error' ? (
        <>
          <p className={cn(typeClass.bodyStrong, 'text-text')}>Não foi possível atualizar</p>
          <p className={cn(typeClass.caption, 'mt-1 text-text/70')}>
            {state.errorMessage ?? 'Tente novamente em instantes.'}
          </p>
          <div className="mt-3">
            <Button size="sm" variant="secondary" onClick={() => void retry()}>
              Tentar novamente
            </Button>
          </div>
        </>
      ) : null}
    </aside>
  );
}
