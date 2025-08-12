import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    checker({
      typescript: true,
      overlay: {
        initialIsOpen: false,
        position: 'tl', // top-left, you can also use 'tr', 'bl', 'br'
        badgeStyle: `
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 9999;
          background: #ff4757;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          cursor: pointer;
        `,
        panelStyle: `
          background: rgba(0, 0, 0, 0.95);
          color: #ff6b6b;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
          padding: 20px;
          border-radius: 8px;
          max-height: 80vh;
          overflow-y: auto;
        `
      },
      enableBuild: false // Only check during development, not build
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@store': path.resolve(__dirname, './src/store'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      "@products/*": path.resolve(__dirname, './src/pages/Product'),
      "@services/*": path.resolve(__dirname, './src/pages/Service'),
      "@chats/*": path.resolve(__dirname, './src/pages/Messages'),
      "@authentication/*": path.resolve(__dirname, './src/pages/Authentication'),
    }
  },
  // Additional server configuration for better error display
  server: {
    hmr: {
      overlay: true // Enable Vite's built-in error overlay
    }
  }
})
