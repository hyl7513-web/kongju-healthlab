// 검색엔진 제출용 사이트맵: /sitemap.xml
import { loadAll } from '../lib/data.mjs';

export function GET({ site }) {
  const base = new URL(import.meta.env.BASE_URL, site).href.replace(/\/?$/, '/');
  const { members } = loadAll();
  const paths = ['', 'about/', 'projects/', 'publications/', 'members/', 'news/', ...members.filter((m) => m.cv).map((m) => `members/${m.id}/`)];
  const today = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
