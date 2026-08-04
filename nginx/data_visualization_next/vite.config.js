import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app is served under the /view path prefix (previously CRA's `homepage`).
// This codebase keeps JSX inside plain `.js` files (a Create React App habit),
// so we tell @vitejs/plugin-react to also transform `.js`/`.jsx` files — Vite 8
// uses Rolldown/oxc, whose parser only enables JSX for files the plugin claims.
export default defineConfig({
  base: '/view/',
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  server: {
    port: 3001,
    host: true,
    // Docker bind-mounts don't emit native FS events reliably on Windows hosts.
    watch: { usePolling: true },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.jsx',
  },
});
