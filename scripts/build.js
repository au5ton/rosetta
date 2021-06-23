require('esbuild').build({
  ...require('./common'),
}).catch(() => process.exit(1))
