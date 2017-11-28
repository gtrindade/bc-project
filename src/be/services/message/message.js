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
    dao.update(_id, {name, msg})
      .then(() => {
        const command = commands.evaluate(name, msg)

        if (command && typeof command.then === `function`) {
          command.then((response) => {
            dao.update(_id, {name, msg, response}, true)
              .then(() => {
                return dao.get(_id)
              })
              .then((edited) => {
                const [first] = edited
                const {editCount} = first

                io.emit(UPDATE, {_id, name, msg, response, editCount})
              })
              .catch(console.error)
          })
        }

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

        if (command && typeof command.then === `function`) {
          const {insertedIds} = created
          const [_id] = insertedIds

          command.then((response) => {
            dao.update(_id, {name, msg, response}, true)
              .then(() => {
                io.emit(UPDATE, {_id, name, msg, response})
              })
              .catch(console.error)
          })
        }

        io.emit(MESSAGE, message)
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
