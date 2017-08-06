import {MongoClient} from 'mongodb'
import Promise from 'bluebird'
Promise.promisifyAll(MongoClient)

const dbName = `bc`
const mongoHost = `mongodb://127.0.0.1:27017/`
const mongoUrl = mongoHost + dbName

export let db
export const client = MongoClient

export const init = () => {
  return MongoClient.connect(mongoUrl)
    .then((mongodb) => {
      db = mongodb
      console.log(`Succesfully connected to the database`)
    })
    .catch((err) => {
      console.log(`err`, err)
    })
}

export default {
  init
}
