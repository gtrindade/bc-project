import dice from '../dice/dice'
import gamestate from '../game-state/game-state'

const PREFIX = `/`
const HIDDEN_PREFIX = `//`

const hasPrefix = prefix => text => text && text.startsWith(prefix)
const isCommand = hasPrefix(PREFIX)
const isHiddenCommand = hasPrefix(HIDDEN_PREFIX)

const evaluate = (name, msg) => {
  if (isCommand(msg)) {
    const tokens = msg.split(` `)
    if (tokens[0]) {
      const prefixLength = isHiddenCommand(msg) ? 2 : 1
      const command = tokens[0].substring(prefixLength, tokens[0].length)
      switch (command) {
        case `roll`: {
          const input = tokens.slice(1, tokens.length).join(` `)
          return dice.roll(input)
        }
        case `set`: {
          const [,path, ...value] = tokens
          return gamestate.set(path, value.join(` `))
        }
        case `get`: {
          const [,path] = tokens
          return gamestate.get(path)
        }
        case `unset`: {
          const [,path] = tokens
          return gamestate.unset(path)
        }
      }
    }
  }
}

const isHidden = msg => isHiddenCommand(msg)

export default {
  evaluate,
  isHidden
}
