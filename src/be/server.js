import fs from 'fs'
import restify from 'restify'
import db from './db'
import message from './services/message'

const serverPort = process.env.PORT || 8080
const serverIpAddress = `0.0.0.0`

export const app = restify.createServer()
 
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

db.init().then(() => {
  message.init(app)

  app.listen( serverPort, serverIpAddress )
  console.log( `Server is running on ${serverPort}` )
})

