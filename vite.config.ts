import solidPlugin from '@solidjs/vite-plugin'
import { defineConfig, type Plugin } from 'vite'

const inlineEntryLoaderPlugin: Plugin = {
  name: 'inline-entry-loader',
  apply: 'build',
  generateBundle: {
    order: 'post',
    handler(_options, bundle) {
      const chunks = Object.values(bundle).filter((file) => file.type === 'chunk')
      const entryLoader = chunks.find(
        (chunk) => chunk.isEntry && chunk.name === 'entryLoader'
      )
      if (entryLoader === undefined)
        return this.error('Missing inline entry loader entry')
      if (entryLoader.imports.length > 0 || entryLoader.exports.length > 0) {
        return this.error('Inline entry loader must not have module imports or exports')
      }
      const entryPreloads: Record<string, string[]> = {}

      for (const name of ['desktop', 'mobile']) {
        const entry = chunks.find((chunk) => chunk.isEntry && chunk.name === name)
        if (entry === undefined) return this.error(`Missing ${name} entry`)

        const files = new Set<string>()
        const collectImports = (fileName: string): void => {
          const chunk = bundle[fileName]
          if (chunk?.type !== 'chunk' || files.has(fileName)) return
          files.add(fileName)
          for (const imported of chunk.imports) collectImports(imported)
        }
        collectImports(entry.fileName)
        entryPreloads[name] = [...files]
      }

      // Keep the graph and its consumer in one artifact; Hugo only supplies its base URL.
      entryLoader.code = `((entryPreloads)=>{${entryLoader.code}\n})(${JSON.stringify(entryPreloads)});\n`
    }
  }
}

export default defineConfig({
  plugins: [solidPlugin(), inlineEntryLoaderPlugin],
  build: {
    outDir: './bundled',
    cssMinify: 'esbuild',
    watch: process.env.DISABLE_WATCH
      ? null
      : {
          include: 'assets/**'
        },
    rollupOptions: {
      input: {
        entryLoader: './assets/ts/entryLoader.ts',
        desktop: './assets/ts/desktop/main.tsx',
        mobile: './assets/ts/mobile/main.tsx',
        style: './assets/scss/style.scss'
      },
      output: {
        format: 'es',
        entryFileNames: (chunk) =>
          chunk.name === 'entryLoader' ? 'entry-loader.js' : 'js/[name].js',
        chunkFileNames: 'js/[hash:6].js',
        assetFileNames: '[ext]/[name].[ext]'
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
