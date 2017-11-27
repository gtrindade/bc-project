import socketIo from 'socket.io'
import dao from './message-dao'
import commands from '../commands/commands'

export const init = (app) => {
  const io = socketIo(app.server)

  const MESSAGE = `message`
  // const MESSAGES = `messages`
  const MESSAGES_FROM = `messages from`
  const UPDATE = `update`
  const CONNECT = `connection`
  const DISCONNECT = `disconnect`

  const disconnectHandler = (socket) => (event) => {
    console.log(`[${event}] user ${socket.id} disconnected`)
  }

  const connectionHandler = (socket) => {
    console.log(`User ${socket.id} connected`)

    dao.getPaginatedFromTime()
      .then((result) => {
        io.emit(MESSAGES_FROM, result)
        socket.on(MESSAGE, messageHandler)
        socket.on(UPDATE, updateHandler)
        socket.on(MESSAGES_FROM, paginatedMessagesHandler)
        socket.on(DISCONNECT, disconnectHandler(socket))
      })
      .catch(console.error)
  }

  const updateHandler = ({name, msg, _id}) => {
    console.log(`update: [${name}]: `, msg, _id)
    dao.update(_id, name, msg)
      .then(() => {
        io.emit(UPDATE, {name, msg, _id})
      })
      .catch(console.error)
  }

  const messageHandler = ({name, msg}) => {
    console.log(`[${name}]: `, msg)

    const command = commands.evaluate(name, msg)

    dao.insert(name, msg)
      .then((created) => {
        const [message] = created.ops
        io.emit(MESSAGE, message)
        if (command) {
          command.then((result) => {
            dao.insert(result.name, result.msg)
              .then(() => {
                io.emit(MESSAGE, result)
              })
              .catch(console.error)
          })
        }
      })
      .catch(console.error)
  }

  const paginatedMessagesHandler = (time) => {
    dao.getPaginatedFromTime(time)
      .then((result) => {
        io.emit(MESSAGES_FROM, result)
      })
      .catch(console.error)
  }

  io.on(CONNECT, connectionHandler)
}

export default {
  init
}
