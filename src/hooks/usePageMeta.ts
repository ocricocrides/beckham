import { useEffect } from 'react';
import { SITE_URL } from '@/lib/constants';

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Título, description, OG e canonical por rota. O index.html só carrega os valores genéricos
 * (é o que os crawlers que não rodam JS enxergam); aqui a gente sobrescreve por página pra que
 * cada rota tenha description própria em vez de repetir a mesma do site inteiro.
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const fullTitle = `${title} // BECKHAM`;
    const url = SITE_URL + location.pathname;

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setCanonical(url);
  }, [title, description]);
}
