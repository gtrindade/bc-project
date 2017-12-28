import {db} from '../../db'

const USERS = `users`

const get = (id) => db.collection(USERS).find({id}).toArray()
const getAll = () => db.collection(USERS).find({}).toArray()

const insert = (payload) => {
  const time = Date.now()
  if (payload) {
    return db.collection(USERS).insert({time, ...payload})
  }
  return Promise.reject(new Error(`Invalid payload`))
}

const upsert = (profile) => {
  if (profile) {
    const filter = {id: profile.id}
    const setter = {$set: profile}
    const options = {upsert: true}

    return db.collection(USERS).update(filter, setter, options)
  }
  return Promise.reject(new Error(`Invalid id (${profile.id})`))
}

export default {
  get,
  getAll,
  insert,
  upsert
}
