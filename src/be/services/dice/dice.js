const rollRegex = /(\d+)(d)(\d+)\ *([+|-])?\ *(\d*)/
const maxDice = 1000
const maxSides = 1000

const rollDie = (sides) => {
  const random = Math.random()
  const result = Math.floor(random * sides + 1)
  return Math.min(result, sides)
}

const rollDice = (dice, sides) => {
  const results = []

  if (dice === 1) {
    return rollDie(sides)
  }

  for (let i = 0; i < dice; i++) {
    results.push(rollDie(sides))
  }
  return results
}

const hasOperator = (operator) => operator === `+` || operator === `-`

const invalidOperator = (operator) => operator && operator !== `+` && operator !== `-`

const sumResults = (results) => results.reduce((total, value) => total + value, 0)

const getModifier = (modifier) => {
  const parsed = parseInt(modifier)
  if (Number.isNaN(parsed)) {
    return 0
  }
  return parsed
}

const applyModifier = (operator, modifier) => operator === `-` ? -modifier : modifier

const formatDice = (dice) => dice.length > 1 ? `[${dice.join(`, `)}]` : dice

const formatRollResult = (roll, dice, operator, modifier, total) => {
  const modString = hasOperator(operator) ? ` ${operator} ${modifier}` : ``
  const manyDice = dice.length > 1
  const result = manyDice || hasOperator(operator) ? `${formatDice(dice)}${modString} = ${total}` : total
  return result
}

const invalidCommand = `Invalid command, please try something like /roll 2d10+33`
const aboveLimit = `Please try at max ${maxDice} dice with no more than ${maxSides} sides each.`
const modifierTooBig = `The modifier value is too big`

const roll = (roll) => {
  const match = roll.match(rollRegex)
  if (match && match.length >= 4) {
    const [, dice,, sides, operator, modifier] = match
    if (invalidOperator(operator)) {
      return invalidCommand
    }
    if (dice > maxDice || sides > maxSides) {
      return aboveLimit
    }
    const modifierValue = getModifier(modifier)
    if (!Number.isSafeInteger(modifierValue)) {
      return modifierTooBig
    }

    const diceResults = rollDice(dice, parseInt(sides))
    const total = sumResults(diceResults) + applyModifier(operator, modifierValue)
    const responseMessage = formatRollResult(roll, diceResults, operator, modifierValue, total)
    return Promise.resolve(responseMessage)
  }
  return Promise.resolve(invalidCommand)
}

export default {
  roll
}
