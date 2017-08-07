// const rollRegex = /(\d+)(d)(\d+)([+|-])(\d+)/
const rollRegex = /(\d+)(d)(\d+)\ *([+|-])\ *(\d+)/

const rollDie = (sides) => Math.floor(Math.random() * sides + 1) 
const rollDies = (dice, sides) => {
  if (dice === 1) {
    return rollDie(sides)
  }
  const results = []
  for (let i = 0; i < dice; i++) {
    results.push(rollDie(sides))
  }
  return results
}
const sumResults = (results) => results.reduce((total, value) => total + value, 0)
const applyModifier = (operator, modifier) => operator === `+` ? modifier : -modifier
const formatDies = (dies) => dies.length > 1 ? `[${dies}]` : dies
const formatRollResult = (name, roll, dies, op, mod, total) =>
  `${name} rolled ${roll} and got: ${formatDies(dies)} ${op} ${mod} = ${total}`


const roll = (name, roll) => {
  const [, dice,, sides, operator, modifier] = roll.match(rollRegex) 
  const dies = rollDies(dice, parseInt(sides))
  const total = sumResults(dies) + applyModifier(operator, parseInt(modifier))

  return {
    name: `Server`,
    msg: formatRollResult(name, roll, dies, operator, modifier, total)
  }
}

export default {
  roll
}
