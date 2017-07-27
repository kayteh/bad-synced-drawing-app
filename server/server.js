// Super simple websocket + fileserver
var server = require('http').createServer()
var io = require('socket.io')(server, { transports: [ 'websocket' ], wsEngine: 'uws' })

function echo (client, event, data) {
  client.broadcast.emit(event, data)
}

io.on('connection', (client) => {
  const echoEvents = [ 'start', 'end', 'draw', 'frame' ]
  for (let e of echoEvents) {
    client.on(e, echo.bind(null, client, e))
  }
})

server.listen(3000)
