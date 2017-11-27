import {db} from '../../db'
// import {ObjectId} from 'mongodb'

const GAME_STATE = `game_state`

const getMessage = (msg) => ({ name: `Server`, msg })
const pick = (path, object) => {
  const props = path.split(`.`)
  return props.reduce((acc, current) => acc[current], object)
}

const getAll = () => db.collection(GAME_STATE).find({}).toArray()

const get = (path) => {
  return db.collection(GAME_STATE).find({[path]: {$exists: true}}).toArray()
    .then((document) => {
      if (!document.length) {
        return getMessage(`Not found.`)
      }
      return getMessage(JSON.stringify(pick(path, document[0]), null, 2))
    })
}

const set = (path, value) => {
  const [base] = path.split(`.`)
  if ( path && value && base ) {
    return db.collection(GAME_STATE).update(
      {[base]: {$exists: true}},
      {$set: {[path]: value}},
      {upsert: true}
    ).then(() => getMessage(`Succesfully set ${value} to ${path}`))
  }
  return Promise.resolve(getMessage(`Invalid path (${path}) or value (${value})`))
}

export default {
  getAll,
  get,
  set
}
