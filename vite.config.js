import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Consolidated Vite config for this workspace
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: {
      '.js': 'jsx'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
        }
      }
    }
  },
  define: {
    'process.env': process.env
  }
})