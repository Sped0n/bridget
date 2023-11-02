import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default {
  input: './assets/ts/main.ts',
  output: {
    dir: './static/bundled/js',
    format: 'es',
    chunkFileNames: '[hash:6].js',
    compact: true
  },
  plugins: [
    resolve({
      moduleDirectories: ['node_modules']
    }),
    typescript({ tsconfig: './tsconfig.json' }),
    process.env.BUILD === 'production' &&
      terser({
        compress: {
          passes: 3
        },
        output: {
          comments: false
        }
      })
  ]
}
