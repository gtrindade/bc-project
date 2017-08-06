import R from 'ramda'
import socketIo from 'socket.io'
import dao from './message-dao'

export const init = (app) => {
  const io = socketIo(app.server)

  const MESSAGE = `message`
  const CONNECT = `connection`
  const DISCONNECT = `disconnect`

  const disconnectHandler = R.curry((socket, event) => {
    console.log(`[${event}] user ${socket.id} disconnected`)
  })

  const connectionHandler = (socket) => {
    console.log(`User ${socket.id} connected`)

    dao.getAll()
      .then((result) => {
        result.map(({name, msg}) => {
          io.emit(MESSAGE, `[${name}]: ${msg}`)
        })
        socket.on(MESSAGE, messageHandler(socket))
        socket.on(DISCONNECT, disconnectHandler(socket))
      })
      .catch(console.error)
  }

  const messageHandler = R.curry((socket, name, msg) => {
    console.log(`[${name}]: `, msg)
    dao.insert(name, msg)
      .then(() => {
        io.emit(MESSAGE, `[${name}]: ${msg}`)
      })
      .catch(console.error)
  })

  io.on(CONNECT, connectionHandler)
}

export default {
  init
}
