const rollRegex = /(\d+)(d)(\d+)\ *([+|-])?\ *(\d*)/
const maxDice = 1000
const maxSides = 1000

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
const applyModifier = (operator, modifier) => operator === `-` ? -modifier : modifier
const formatDice = (dice) => dice.length > 1 ? `[${dice.join(`, `)}]` : dice
const formatRollResult = (name, roll, dice, operator, modifier, total) => {
  const modString = hasOperator(operator) ? ` ${operator} ${modifier}` : ``
  const manyDice = dice.length > 1
  const result = manyDice || hasOperator(operator) ? `${formatDice(dice)}${modString} = ${total}` : total
  return `${name} rolled ${roll} and got: ${result}`
}

const getMessage = (msg) => ({ name: `Server`, msg })
const invalidCommand = getMessage(`Invalid command, please try something like /roll 2d10+33`)
const aboveLimit = getMessage(`Please try at max ${maxDice} dice with no more than ${maxSides} sides each.`)
const modifierTooBig = getMessage(`The modifier value is too big`)

const roll = (name, roll) => {
  const match = roll.match(rollRegex)
  if (match && match.length >= 4) {
    const [, dice,, sides, operator, modifier] = match
    if (invalidOperator(operator)) {
      return invalidCommand
    }
    if (dice > maxDice || sides > maxSides) {
      return aboveLimit
    }
    const modifierValue = parseInt(modifier)
    if (!Number.isSafeInteger(modifierValue)) {
      return modifierTooBig
    }

    const diceResults = rollDice(dice, parseInt(sides))
    const total = sumResults(diceResults) + applyModifier(operator, modifierValue)
    const responseMessage = formatRollResult(name, roll, diceResults, operator, modifierValue, total)
    return getMessage(responseMessage)
  }
  return invalidCommand
}

export default {
  roll
}
