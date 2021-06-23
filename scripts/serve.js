require('esbuild').serve({
  servedir: 'dist',
}, {
  ...require('./common'),
  incremental: true,
}).then(server => {
  console.log(`Listening on http://${server.host}:${server.port}`);
})