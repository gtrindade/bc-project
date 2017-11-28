import {db} from '../../db'
// import {ObjectId} from 'mongodb'

const GAME_STATE = `game_state`

const pick = (path, object) => path.split(`.`).reduce((acc, current) => acc[current], object)

const getAll = () => db.collection(GAME_STATE).find({}).toArray()

const get = (path) => db.collection(GAME_STATE).find({[path]: {$exists: true}})
  .toArray()
  .then(([document]) =>
    document ?
    JSON.stringify(pick(path, document), null, 2) :
    `Not found.`
  )

const set = (path, input) => {
  if (!input) return Promise.resolve(`Missing value`)
  if (!path) return Promise.resolve(`Missing path`)
  const [base] = path.split(`.`)
  if (!base) return Promise.resolve(`Invalid path [${path}]`)


  try {
    const value = JSON.parse(input)
    const filter = {[base]: {$exists: true}}
    const setter = {$set: {[path]: value}}
    const options = {upsert: true}

    return db.collection(GAME_STATE).update(filter, setter, options)
      .then(() => `Succesfully set [${path}]`)
  } catch (e) {
    return Promise.resolve(`Unable to parse input`)
  }
}

const unset = (path) => {
  const [base] = path.split(`.`)

  if ( !path || !base ) {
    return Promise.resolve(`Invalid path [${path}]`)
  }

  const filter = {[base]: {$exists: true}}
  const setter = {$unset: {[path]: ``}}

  return db.collection(GAME_STATE).update(filter, setter)
    .then(() => `Succesfully unset [${path}]`)
}

export default {
  getAll,
  get,
  set,
  unset
}
