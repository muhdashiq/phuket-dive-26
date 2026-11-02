import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Relative base so the build works from any GitHub Pages path.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
