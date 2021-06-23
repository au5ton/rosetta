/** @type { import('esbuild').BuildOptions } */
module.exports = {
  entryPoints: [
    'src/index.ts'
  ],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es6',
  outdir: 'dist',
}