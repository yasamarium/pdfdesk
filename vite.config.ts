import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && req.url.startsWith('/v/') && !req.url.includes('.')) {
          req.url = '/index.html';
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    spaFallbackPlugin(),
    tailwindcss(),
    react(),
  ],
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdf-lib', 'jszip'],
  },
})
