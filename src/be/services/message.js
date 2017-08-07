import R from 'ramda'
import socketIo from 'socket.io'
import dao from './message-dao'
import commands from './commands'

export const init = (app) => {
  const io = socketIo(app.server)

  const MESSAGE = `message`
  const MESSAGES = `messages`
  const UPDATE = `update`
  const CONNECT = `connection`
  const DISCONNECT = `disconnect`

  const disconnectHandler = R.curry((socket, event) => {
    console.log(`[${event}] user ${socket.id} disconnected`)
  })

  const connectionHandler = (socket) => {
    console.log(`User ${socket.id} connected`)

    dao.getAll()
      .then((result) => {
        io.emit(MESSAGES, result)
        socket.on(MESSAGE, messageHandler)
        socket.on(UPDATE, updateHandler)
        socket.on(DISCONNECT, disconnectHandler(socket))
      })
      .catch(console.error)
  }

  const updateHandler = ({name, msg, _id}) => {
    console.log(`update: [${name}]: `, msg, _id)
    dao.update(_id, name, msg)
      .then((result) => {
        console.log(`result`, result)
        io.emit(UPDATE, {name, msg, _id})
      })
      .catch(console.error)
  }

  const messageHandler = ({name, msg}) => {
    console.log(`[${name}]: `, msg)

    const result = commands.evaluate(name, msg)

    dao.insert(name, msg)
      .then((created) => {
        const [message] = created.ops
        io.emit(MESSAGE, message)
        if (result) {
          dao.insert(result.name, result.msg)
            .then(() => {
              io.emit(MESSAGE, result)
            })
            .catch(console.error)
        }
      })
      .catch(console.error)
  }

  io.on(CONNECT, connectionHandler)
}

export default {
  init
}
