import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

/** iOS Safari can white-screen on module scripts tagged crossorigin on static deploys. */
function stripCrossorigin(): Plugin {
  return {
    name: 'strip-crossorigin',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        let out = html.replace(/ crossorigin/g, '');
        const moduleScripts = out.match(/<script type="module"[^>]*><\/script>/g) ?? [];
        for (const tag of moduleScripts) {
          out = out.replace(tag, '');
          out = out.replace('</body>', `  ${tag}\n</body>`);
        }
        return out;
      },
    },
  };
}

/** Restarto portfolio path by default; standalone Vercel uses VITE_BASE=/ */
const DEPLOY_BASE = process.env.VITE_BASE || '/portfolio/access4all/app/';

export default defineConfig({
  plugins: [tailwindcss(), react(), stripCrossorigin()],
  base: DEPLOY_BASE,
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: ['es2019', 'safari14'],
    modulePreload: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
