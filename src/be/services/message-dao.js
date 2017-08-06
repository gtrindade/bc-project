import {db} from '../db'

const getAll = () =>
  db.collection(`messages`).find({}).toArray()

const insert = (name, msg) =>
  db.collection(`messages`).insert({name, msg})

export default {
  getAll,
  insert
}

/*
  db.collection(`messages`).find({}).toArray((err, result) => {
    if (err) {
      console.log(`err`, err)
      return err
    }
    
    return result || []
  })

  db.collection(`messages`).insert({name, msg}, (err, result) => {
    if (err) {
      console.log(`err`, err)
      return err
    }
    console.log(`Inserted sucessfully into the database`, result.ops)
  })

 */
