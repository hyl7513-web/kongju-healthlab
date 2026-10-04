// 사이트 내부 링크에 base 경로를 붙인다. u('/members') → /kongju-healthlab/members
export function u(p = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + (p.startsWith('/') ? p : '/' + p);
}
