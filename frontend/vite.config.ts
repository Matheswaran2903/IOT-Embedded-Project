import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The lazy-loaded 3D page bundles three.js (~850 kB minified), which cannot be made smaller.
  build: { chunkSizeWarningLimit: 900 },
});
