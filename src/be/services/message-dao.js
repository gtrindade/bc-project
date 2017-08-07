import {db} from '../db'
import {ObjectId} from 'mongodb'

const getAll = () => db.collection(`messages`).find({}).toArray()
const insert = (name, msg) => {
  if ( name && msg ) {
    return db.collection(`messages`).insert({name, msg})
  }
  return Promise.reject(new Error(`Invalid name (${name}) or message (${msg})`))
}
const update = (_id, name, msg) => {
  if ( _id && name && msg ) {
    return db.collection(`messages`).update({_id: ObjectId(_id)}, {name, msg})
  }
  return Promise.reject(new Error(`Invalid name (${name}) or message (${msg})`))
}

export default {
  getAll,
  insert,
  update
}
