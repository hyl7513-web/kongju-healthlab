import { defineConfig } from 'astro/config';

// GitHub Pages 주소: https://hyl7513-web.github.io/kongju-healthlab/
// 나중에 별도 도메인을 연결하면 site 를 그 주소로, base 를 '/' 로 바꾸면 된다.
export default defineConfig({
  site: 'https://hyl7513-web.github.io',
  base: '/kongju-healthlab',
  trailingSlash: 'ignore',
});
