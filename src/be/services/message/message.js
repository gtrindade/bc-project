import socketIo from 'socket.io'
import dao from './message-dao'
import commands from '../commands/commands'
// import jwt from 'jsonwebtoken'

// const getCookie = (input, name) => {
  // const cookies = input.split(`;`)
  // const pairs = cookies.map((cookie) => cookie.split(`=`))
  // const target = pairs.find((item) => item[0] == name)
  // return target && target[1]
// }

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
    // const token = getCookie(socket.handshake.headers.cookie, `session`)
    // console.log(`token`, token)
    // const profile = jwt.verify(token, `secret`)
    // console.log(`profile`, profile)

    dao.getPaginatedFromTime()
      .then((result) => {
        socket.emit(MESSAGES_FROM, result)
        socket.on(MESSAGE, messageHandler(socket))
        socket.on(UPDATE, updateHandler)
        socket.on(MESSAGES_FROM, paginatedMessagesHandler(socket))
        socket.on(DISCONNECT, disconnectHandler(socket))
      })
      .catch(console.error)
  }

  const updateHandler = ({name, msg, _id}) => {
    console.log(`update: [${name}]: `, msg, _id)
    dao.update(_id, {name, msg})
      .then(() => {
        const command = commands.evaluate(name, msg)

        if (command && command.promise && typeof command.promise.then === `function`) {
          command.promise.then((response) => {
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

  const messageHandler = socket => ({name, msg}) => {
    console.log(`[${name}]: `, msg)

    const command = commands.evaluate(name, msg)

    if (command.shouldSave) {
      dao.insert(name, msg)
        .then((created) => {
          const [message] = created.ops
          const {promise: commandPromise} = command

          if (commandPromise && typeof commandPromise.then === `function`) {
            const {insertedIds} = created
            const [_id] = insertedIds

            commandPromise.then((response) => {
              dao.update(_id, {name, msg, response}, true)
                .then(() => {
                  const commandResponse = {_id, name, msg, response}
                  if (commands.isHidden(msg)) {
                    socket.emit(UPDATE, commandResponse)
                  } else {
                    io.emit(UPDATE, commandResponse)
                  }
                })
                .catch(console.error)
            })
          }

          io.emit(MESSAGE, message)
        })
        .catch(console.error)
    }
  }

  const paginatedMessagesHandler = socket => time => {
    dao.getPaginatedFromTime(time)
      .then((result) => {
        socket.emit(MESSAGES_FROM, result)
      })
      .catch(console.error)
  }

  io.on(CONNECT, connectionHandler)
}

export default {
  init
}
