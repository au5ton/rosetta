require('esbuild').build({
  ...require('./common'),
  outdir: 'dist',
}).catch(() => process.exit(1))
