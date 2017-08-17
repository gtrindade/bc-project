import {db} from '../../db'
import {ObjectId} from 'mongodb'

const paginationSize = 20
const messages = `messages`

const getAll = () => db.collection(messages).find({}).toArray()
const getPaginatedFromTime = (time = Date.now()) =>
  db.collection(messages).find({time: {$lt: time}}, {sort: {time: -1}, limit: paginationSize}).toArray()
    .then((result) => result.reverse())
const insert = (name, msg) => {
  const time = Date.now()
  if ( name && msg ) {
    return db.collection(messages).insert({time, name, msg})
  }
  return Promise.reject(new Error(`Invalid name (${name}) or message (${msg})`))
}
const update = (_id, name, msg) => {
  if ( _id && name && msg ) {
    return db.collection(messages).update({_id: ObjectId(_id)}, {$set: {name, msg}})
  }
  return Promise.reject(new Error(`Invalid name (${name}) or message (${msg})`))
}

export default {
  getPaginatedFromTime,
  getAll,
  insert,
  update
}
