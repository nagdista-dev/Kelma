import { useEffect } from 'react';

const SITE_NAME = 'Kelma';
const ORIGIN = 'https://kelma-en.vercel.app';

/**
 * Per-route document title / description / canonical for crawlers
 * and browser tabs. Falls back to the index.html defaults.
 */
export function usePageMeta(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = `${title} · ${SITE_NAME}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `${ORIGIN}${path}`);
  }, [title, description, path]);
}
