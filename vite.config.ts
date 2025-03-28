import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';
import axiosRetry from 'axios-retry';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/src/utils/dashboardPresets.ts': '/src/utils/dashboardPresets.tsx'
    },
  },
  server: {
    host: true, // Needed for proper WebContainer support
    hmr: {
      // Disable HMR in WebContainer environment since it's not fully supported
      clientPort: undefined,
      port: undefined,
      host: undefined
    },
    proxy: {
      '/api/coingecko': {
        target: 'https://pro-api.coingecko.com/api/v3',
        changeOrigin: true,
        secure: true,
        timeout: 60000,
        proxyTimeout: 60000,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
        configure: (proxy, options) => {
          // Configure axios with retry logic
          const axiosInstance = axios.create();
          axiosRetry(axiosInstance, { 
            retries: 5,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
              return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
                     error.response?.status === 429 || // Rate limit
                     error.response?.status === 500 || // Server error
                     error.response?.status === 502 || // Bad gateway
                     error.response?.status === 503 || // Service unavailable
                     error.response?.status === 504;   // Gateway timeout
            }
          });

          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Use environment variable for API key with fallback
            const apiKey = process.env.VITE_COINGECKO_API_KEY || 'CG-gTgiBRydF4PqMfgYZ4Wr6fxB';
            proxyReq.setHeader('x-cg-pro-api-key', apiKey);
          });

          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            if (!res.headersSent) {
              const retryAfter = err.response?.headers?.['retry-after'];
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                ...(retryAfter ? { 'Retry-After': retryAfter } : {})
              });
              res.end(JSON.stringify({ 
                error: 'Proxy error occurred',
                message: err.message,
                code: err.code,
                ...(retryAfter ? { retryAfter: parseInt(retryAfter, 10) } : {})
              }));
            }
          });
        }
      },
      '/api/twitter/trends': {
        target: 'https://twitter-api45.p.rapidapi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/twitter\/trends/, '/trends.php?country=UnitedStates'),
        headers: {
          'x-rapidapi-host': 'twitter-api45.p.rapidapi.com',
          'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a'
        },
        onProxyError: (err, req, res) => {
          console.error('Twitter proxy error:', err);
          if (!res.headersSent) {
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('Twitter proxy error occurred');
          }
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-hover-card', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'grid-vendor': ['react-grid-layout', 'gridstack']
        }
      }
    },
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild'
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true,
  }
});