import fs from 'fs'
import restify from 'restify'
import R from 'ramda'
import socketIo from 'socket.io'
import mongo from 'mongodb'

const serverPort = 8080
const serverIpAddress = `127.0.0.1`

const dbName = `bc`
const mongoHost = `mongodb://127.0.0.1:27017/`
const mongoUrl = mongoHost + dbName

const app = restify.createServer()
const io = socketIo(app.server)
 
mongo.connect(mongoUrl, (err, db) => {
  if (err) {
    console.log(`err`, err)
    return
  }
  console.log(`Succesfully connected to the database`)
  app.get(`/`, ( req, res ) => {
    fs.readFile(`index.html`, (err, data) => {
      res.writeHead(200, {
        [`Content-Type`]: `text/html`,
        [`Content-Length`]: data.length
      })
      res.write(data)
      res.end()
    })}
  )
  app.get(/\/public\/?.*/, restify.serveStatic({ directory: __dirname }))

  const MESSAGE = `message`
  const CONNECT = `connection`
  const DISCONNECT = `disconnect`

  const disconnectHandler = R.curry((socket, event) => {
    console.log(`[${event}] user ${socket.id} disconnected`)
  })

  const connectionHandler = (socket) => {
    console.log(`User ${socket.id} connected`)

    const messages = db.collection(`messages`)
    messages.find({}).toArray((err, result) => {
      if (err) {
        console.log(`err`, err)
        return
      }
      
      result.map(({name, msg}) => {
        io.emit(MESSAGE, `[${name}]: ${msg}`)
      })
    })

    socket.on(MESSAGE, messageHandler(socket))
    socket.on(DISCONNECT, disconnectHandler(socket))
  }

  const messageHandler = R.curry((socket, msg, name) => {
    console.log(`[${name}]: `, msg)
    const messages = db.collection(`messages`)
    messages.insert({name, msg}, (err, result) => {
      if (err) {
        console.log(`err`, err)
        return
      }
      console.log(`Inserted sucessfully into the database`, result.ops)
    })
    io.emit(MESSAGE, `[${name}]: ${msg}`)
  })

  io.on(CONNECT, connectionHandler)

  app.listen( serverPort, serverIpAddress )
  console.log( `Server is running on 8080` )
})
