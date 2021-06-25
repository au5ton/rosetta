/** @type { import('esbuild').BuildOptions } */
module.exports = {
  entryPoints: [
    'src/index.ts'
  ],
  bundle: true,
  sourcemap: true,
  minifyIdentifiers: false,
  minifySyntax: true,
  minifyWhitespace: true,
  loader: {
    '.svg': 'text',
    '.gif': 'dataurl'
  },
  format: 'iife',
  platform: 'browser',
  target: 'es6',
}