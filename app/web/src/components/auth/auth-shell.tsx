import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type AuthShellProps = {
  children: ReactNode;
};

/** Grid 20% / 60% / 20%: título, campos, ações. */
export const AUTH_GRID_FORM_CLASS =
  'grid min-h-0 w-full flex-1 grid-rows-[minmax(0,2fr)_minmax(0,6fr)_minmax(0,2fr)] gap-0';

/** Faixa do título: alinhado ao fundo da célula (bottom). */
export const AUTH_GRID_ROW_TITLE_CLASS =
  'flex min-h-0 flex-col items-center justify-end overflow-hidden px-1';

/** Faixa de campos (meio): centrado na célula. */
export const AUTH_GRID_ROW_FIELDS_CLASS =
  'flex min-h-0 w-full flex-col items-center justify-center overflow-y-auto';

/** Faixa de link + botão: conteúdo alinhado ao topo da célula. */
export const AUTH_GRID_ROW_ACTIONS_CLASS =
  'flex min-h-0 w-full flex-col items-center justify-start gap-5 overflow-y-auto';

/** Classes do título (h1) nas páginas de auth (Welcome, Create Account, Forgot Password em destaque). */
export function authTitleClassName(title: string) {
  const isHeroTitle =
    title === 'Welcome' || title === 'Create Account' || title === 'Forgot Password';

  return cn(
    'm-0 text-center leading-none tracking-tight',
    isHeroTitle ? cn(typeClass.hero, 'font-extrabold') : typeClass.display,
    typeToneClass.accent,
  );
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="fixed inset-0 z-[1000] h-[100dvh] w-full overflow-hidden overscroll-none bg-background">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden items-center justify-end lg:flex">
        <div className="relative -translate-x-[12%]">
          <Image
            src="/gym%201.png"
            alt=""
            width={639}
            height={895}
            className="h-auto w-auto max-w-none"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent lg:w-[50%]" />
        </div>
      </div>

      <div className="relative z-20 box-border flex h-full min-h-0 w-full items-stretch justify-start py-12 pl-[calc(100vw/7)] pr-4 max-[480px]:pl-4">
        <div className="relative z-20 flex h-full min-h-0 w-full max-w-[650px] flex-col items-stretch lg:max-w-[650px]">
          <div
            className="pointer-events-none absolute left-1/2 top-[48%] z-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.6]"
            aria-hidden
          >
            <Image
              src="/tinta.png"
              alt=""
              width={1200}
              height={937}
              className="h-auto w-auto max-w-none"
              priority
            />
          </div>

          <div className="relative isolate z-10 flex min-h-0 w-full flex-1 flex-col rounded-xl bg-gradient-to-br from-[#600426] to-[#C6094E] p-px shadow-[0_0_60px_var(--color-auth-shadow)]">
            <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-layer1 px-14 sm:px-20">
              {children}
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute right-0 top-0 z-[200] select-none"
        aria-hidden
      >
        <Image
          src="/fuma%C3%A7a.png"
          alt=""
          width={1920}
          height={994}
          className="h-auto w-auto max-w-[min(100vw,1920px)]"
          priority
        />
      </div>
    </div>
  );
}
