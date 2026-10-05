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
  server: {
    proxy: {
      '/api/chat': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: () => '/v1/chat/completions',
      },
      '/api/nvidia': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdf-lib', 'jszip'],
  },
})
