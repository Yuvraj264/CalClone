import { useEffect } from 'react';

export default function ForceLightTheme() {
  useEffect(() => {
    const forceLight = () => {
      const html = document.documentElement;
      const body = document.body;

      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
      }
      if (body?.classList.contains('dark')) {
        body.classList.remove('dark');
      }

      // Force color-scheme to light in style engine
      html.style.colorScheme = 'light';
      if (body) {
        body.style.colorScheme = 'light';
      }
    };

    // Run immediately on load
    forceLight();

    // 1. High-frequency active sweep (100ms) to bypass any delayed browser actions or extensions
    const intervalId = setInterval(forceLight, 100);

    // 2. Set up MutationObserver to watch class mutations on <html> and <body>
    const observer = new MutationObserver((mutations) => {
      let shouldForce = false;
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('dark')) {
            shouldForce = true;
          }
        }
      });
      if (shouldForce) {
        forceLight();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, []);

  return null;
}
