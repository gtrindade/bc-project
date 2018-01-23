import request from 'request'

const {TELEGRAM_BOT_TOKEN} = process.env

const domain = `https://api.telegram.org`
const bot = `/bot${TELEGRAM_BOT_TOKEN}`
const pingChat = -1001320690244
const sendMessagePath = `/sendMessage`
const getMessageQuery = (chatId, message) => `?chat_id=${chatId}&text=${message}`

const messageEndpoint = (id, msg) => `${domain}${bot}${sendMessagePath}${getMessageQuery(id, msg)}`

const sendMessage = (msg) => {
  request.post(messageEndpoint(pingChat, msg), {}, (error) => {
    if (error) { 
      console.log(`error: `, error)
    }
  })
}

export default {
  sendMessage
}
