import {MongoClient} from 'mongodb'
import Promise from 'bluebird'
Promise.promisifyAll(MongoClient)

const dbName = `bc`
const mongoUrl = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/` + dbName

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
