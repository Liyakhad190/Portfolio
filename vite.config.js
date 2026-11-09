import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom plugin to handle local API routes for saving data
const localApiPlugin = () => ({
  name: 'local-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Parse JSON body helper
      const parseBody = (req) => {
        return new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve(null);
            }
          });
        });
      };

      if (req.method === 'POST' && req.url === '/api/projects') {
        parseBody(req).then(data => {
          if (data) {
            fs.writeFileSync(path.join(__dirname, 'src', 'data', 'projects.json'), JSON.stringify(data, null, 2));
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } else {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }

      if (req.method === 'POST' && req.url === '/api/certificates') {
        parseBody(req).then(data => {
          if (data) {
            fs.writeFileSync(path.join(__dirname, 'src', 'data', 'certificates.json'), JSON.stringify(data, null, 2));
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } else {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }
      
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174,
    strictPort: true, // Prevents falling back to another port if 5174 is busy
  },
  plugins: [react(), localApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Only the always-needed vendor code is pinned into named chunks.
          // Three.js / R3F / Rapier / Spline are deliberately NOT listed here:
          // forcing them into chunks made Rollup treat them as static deps of
          // the entry, so ~940 kB of the 3D stack was preloaded and parsed on
          // first paint even though the Lanyard is React.lazy. Letting Rollup
          // split on the dynamic import() boundary keeps them lazy.
          'react-vendor': ['react', 'react-dom'],
          'motion-vendor': ['framer-motion', 'gsap'],
          'ui-vendor': [
            'react-icons',
            'lucide-react',
            'clsx',
            'tailwind-merge',
          ],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Fast esbuild minification
    minify: 'esbuild',
    // `esbuild` must be nested inside `build` — at the top level it is ignored,
    // so console/debugger statements were never actually stripped.
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'three',
      // Pre-bundling Spline's runtime collapses its hundreds of internal ESM
      // files into one request. Excluding it produced a large dev-server
      // request waterfall, which read as a slow, laggy first load.
      '@splinetool/react-spline',
      '@splinetool/runtime',
    ],
  },
})
