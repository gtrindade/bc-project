import {db} from '../../db'
import {ObjectId} from 'mongodb'

const PAGINATION_SIZE = 40
const MESSAGES = `messages`

const get = (_id) => db.collection(MESSAGES).find({_id: ObjectId(_id)}).toArray()
const getAll = () => db.collection(MESSAGES).find({}).toArray()

const getPaginatedFromTime = (time = Date.now()) =>
  db.collection(MESSAGES).find({time: {$lt: time}}, {sort: {time: -1}, limit: PAGINATION_SIZE}).toArray()
    .then((result) => result.reverse())

const insert = (name, msg) => {
  const time = Date.now()
  if ( name && msg ) {
    return db.collection(MESSAGES).insert({time, name, msg, editCount: 0})
  }
  return Promise.reject(new Error(`Invalid name (${name}) or message (${msg})`))
}

const update = (_id, payload, skipCount) => {
  const {name, msg} = payload
  if ( _id && name && msg ) {
    const increment = skipCount ? {} : {$inc: {editCount: 1}}
    return db.collection(MESSAGES).update({_id: ObjectId(_id)}, {$set: payload, ...increment})
  }
  return Promise.reject(new Error(`Invalid name (${name}) or message (${msg})`))
}

export default {
  get,
  getPaginatedFromTime,
  getAll,
  insert,
  update
}
