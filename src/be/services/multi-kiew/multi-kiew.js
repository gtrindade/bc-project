import request from 'request'

const {
  TELEGRAM_BOT_TOKEN,
  PING_CHAT,
} = process.env

const domain = `https://api.telegram.org`
const bot = `/bot${TELEGRAM_BOT_TOKEN}`
// const pingBC = -1001320690244
// const bcNew = -1001313196804
const sendMessagePath = `/sendMessage`
const getMessageQuery = (chatId, message) => `?chat_id=${chatId}&text=${message}`

const messageEndpoint = (id, msg) => `${domain}${bot}${sendMessagePath}${getMessageQuery(id, msg)}`

const sendMessage = (msg) => new Promise((resolve, reject) => {
  return request.post(messageEndpoint(PING_CHAT, msg), {}, (error, response) => {
    if (error) { 
      reject(error)
    }
    resolve(response)
  })
})

export default {
  sendMessage
}
