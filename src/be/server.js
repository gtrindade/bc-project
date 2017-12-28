import fs from 'fs'
import restify from 'restify'
import db from './db'
import message from './services/message/message'
import CookieParser from 'restify-cookies'
import session from 'cookie-session'
import passport from 'passport-restify'
import {Strategy as GoogleStrategy} from 'passport-google-oauth2'
import userDAO from './services/user/user-dao'

const serverPort = process.env.PORT || 8080
const serverIpAddress = `0.0.0.0`
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SESSION_SECRET
} = process.env

export const app = restify.createServer()

const googleStrategyConfig = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `/auth/google/callback`,
  passReqToCallback: true
}

const googleStrategyCallback = (req, accessToken, refreshToken, profile, done) => {
  return userDAO.upsert(profile).then(() => done(null, profile))
}

passport.use(new GoogleStrategy(googleStrategyConfig, googleStrategyCallback))

passport.serializeUser((user, done) => {
  userDAO.upsert(user).then(() => {
    done(null, user)
  })
})

passport.deserializeUser((profile, done) => {
  userDAO.get(profile.id).then((user) => {
    done(null, user)
  })
})

app.use(restify.queryParser())
app.use(restify.bodyParser())
app.use(restify.gzipResponse())
app.use(restify.requestLogger())
app.use(CookieParser.parse)

app.use(session({ secret: SESSION_SECRET }))
app.use(passport.initialize())
app.use(passport.session())

app.get(`/auth/google`, passport.authenticate(`google`, {
  scope: [`email`]
})) 

app.get(`/auth/google/callback`, passport.authenticate(`google`, {
  successRedirect: `/`,
  failureRedirect: `/auth/google`
}))

app.get(`/logout`, (req, res, next) => {
  req.logout()
  req.session = null
  res.clearCookie(`session`)
  res.clearCookie(`session.sig`)
  res.redirect(`/`, next)
})

const ensureAuthenticated = (req, res, next) => {
  if (req.user) {
    return next()
  }
  res.redirect(`/auth/google`, next)
}
 
app.get(`/`, ensureAuthenticated, ( req, res ) => {
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

