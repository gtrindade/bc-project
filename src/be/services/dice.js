// const rollRegex = /(\d+)(d)(\d+)([+|-])(\d+)/
const rollRegex = /(\d+)(d)(\d+)\ *([+|-])?\ *(\d*)/

const rollDie = (sides) => {
  const random = Math.random()
  const result = Math.floor(random * sides + 1)
  return Math.min(result, sides)
}

const rollDice = (dice, sides) => {
  if (dice === 1) {
    return rollDie(sides)
  }
  const results = []
  for (let i = 0; i < dice; i++) {
    results.push(rollDie(sides))
  }
  return results
}

const hasOperator = (operator) => operator === `+` || operator === `-`
const invalidOperator = (operator) => operator && operator !== `+` && operator !== `-`
const sumResults = (results) => results.reduce((total, value) => total + value, 0)
const applyModifier = (operator, modifier) => {
  const value = parseInt(modifier)
  if (Number.isNaN(value)) {
    return 0
  }
  return operator === `-` ? -value : value
}
const formatDice = (dice) => dice.length > 1 ? `[${dice.join(`, `)}]` : dice
const formatRollResult = (name, roll, dice, operator, modifier, total) => {
  const modString = hasOperator(operator) ? ` ${operator} ${modifier}` : ``
  const manyDice = dice.length > 1
  const result = manyDice || hasOperator(operator) ? `${formatDice(dice)}${modString} = ${total}` : total
  return `${name} rolled ${roll} and got: ${result}`
}
const errorMessage = {
  name: `Server`,
  msg: `Invalid command, please try something like /roll 2d10+33`
}


const roll = (name, roll) => {
  const match = roll.match(rollRegex)
  if (match && match.length >= 4) {
    const [, dice,, sides, operator, modifier] = match
    if (invalidOperator(operator)) {
      return errorMessage
    }
    const diceResults = rollDice(dice, parseInt(sides))
    const total = sumResults(diceResults) + applyModifier(operator, modifier)

    return {
      name: `Server`,
      msg: formatRollResult(name, roll, diceResults, operator, modifier, total)
    }
  }
  return errorMessage
}

export default {
  roll
}
