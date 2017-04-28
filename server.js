const fs = require( "fs" )
const restify = require( "restify" )
const app = restify.createServer()
const io = require("socket.io")(app.server)
const R = require("ramda")
 
app.get(`/`, function( req, res ){
  fs.readFile('index.html',function (err, data){
    res.writeHead(200, {
      [`Content-Type`]: `text/html`,
      [`Content-Length`]: data.length
    })
    res.write(data)
    res.end()
  })}
)
 
app.get(/\/public\/?.*/, restify.serveStatic({
    directory: __dirname
}))

const MESSAGE = `message`
const CONNECT = `connection`
const DISCONNECT = `disconnect`

const disconnectHandler = R.curry((socket, event) => {
  console.log(`[${event}] user ${socket.id} disconnected`)
})

const connectionHandler = (socket) => {
  console.log(`User ${socket.id} connected`)

  socket.on(MESSAGE, messageHandler(socket))
  socket.on(DISCONNECT, disconnectHandler(socket))
}

const messageHandler = R.curry((socket, msg, name) => {
  console.log(`[${name}]: `, msg)
  io.emit(MESSAGE, `[${name}]: ${msg}`)
})

io.on(CONNECT, connectionHandler)

app.listen( 8080 )
console.log( `Server is running on 8080` )
