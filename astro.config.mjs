// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://system-design-log.erichandal.workers.dev',
  // Cloudflare static assets 307-redirect /about -> /about/. Emitting and linking
  // trailing slashes everywhere avoids a redirect hop on every internal click.
  trailingSlash: 'always',
});
