import Script from 'next/script';

import { THEME_STORAGE_KEY } from '@/lib/theme';

export default function Head() {
  return (
    <>
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==='light')document.documentElement.classList.add('light');}catch(e){}`,
        }}
      />
    </>
  );
}

