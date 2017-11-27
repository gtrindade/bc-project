import {db} from '../../db'
import {ObjectId} from 'mongodb'

const PAGINATION_SIZE = 20
const MESSAGES = `messages`

const getAll = () => db.collection(MESSAGES).find({}).toArray()

const getPaginatedFromTime = (time = Date.now()) =>
  db.collection(MESSAGES).find({time: {$lt: time}}, {sort: {time: -1}, limit: PAGINATION_SIZE}).toArray()
    .then((result) => result.reverse())

const insert = (name, msg) => {
  const time = Date.now()
  if ( name && msg ) {
    return db.collection(MESSAGES).insert({time, name, msg})
  }
  return Promise.reject(new Error(`Invalid name (${name}) or message (${msg})`))
}

const update = (_id, name, msg) => {
  if ( _id && name && msg ) {
    return db.collection(MESSAGES).update({_id: ObjectId(_id)}, {$set: {name, msg}})
  }
  return Promise.reject(new Error(`Invalid name (${name}) or message (${msg})`))
}

export default {
  getPaginatedFromTime,
  getAll,
  insert,
  update
}
