import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    outDir: './static',
    watch: {
      include: 'assets/ts/**'
    },
    rollupOptions: {
      input: './assets/ts/main.tsx',
      output: {
        dir: './static/bundled/js',
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[hash:6].js',
        compact: true
      }
    },
    terserOptions: {
      compress: {
        passes: 3
      },
      output: {
        comments: false
      }
    }
  }
})
