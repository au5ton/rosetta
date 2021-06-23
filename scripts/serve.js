require('esbuild').serve({
  servedir: 'example',
}, {
  ...require('./common'),
  incremental: true,
}).then(server => {
  console.log(`Listening on http://${server.host}:${server.port}`);
})