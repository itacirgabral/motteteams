import { WebSocketServer } from 'ws'

console.log(`appname=${process.env.APP_NAME}`)

const echo = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  }
})

echo.on('connection', function connection (ws) {
  ws.on('message', function message (data) {
    console.log('received: %s', data)

    setTimeout(() => {
      ws.send(data)
      console.log('sent back: %s', data)
    }, 1000)
  })
})
