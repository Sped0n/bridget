import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    outDir: './',
    watch: process.env.DISABLE_WATCH
      ? null
      : {
          include: 'assets/**'
        },
    rollupOptions: {
      input: {
        main: './assets/ts/main.tsx',
        critical: './assets/ts/critical.ts'
      },
      output: {
        format: 'es',
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === 'critical'
            ? 'assets/bundled/[name].js'
            : 'static/bundled/js/[name].js',
        chunkFileNames: 'static/bundled/js/[hash:6].js',
        assetFileNames: (assetInfo) =>
          assetInfo.names[0]?.startsWith('critical')
            ? 'assets/bundled/[name].[ext]'
            : 'static/bundled/[ext]/[name].[ext]',
        compact: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['./assets/scss']
      }
    }
  }
})
