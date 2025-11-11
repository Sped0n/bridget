import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    outDir: './static/bundled',
    watch: process.env.DISABLE_WATCH
      ? null
      : {
          include: 'assets/**'
        },
    rollupOptions: {
      input: './assets/ts/main.tsx',
      output: {
        format: 'es',
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[hash:6].js',
        assetFileNames: '[ext]/[name].[ext]',
        compact: true
      }
    }
  }
})
