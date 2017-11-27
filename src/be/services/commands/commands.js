import dice from '../dice/dice'
import gamestate from '../game-state/game-state'

const PREFIX = `/`

const isCommand = (text) => text && text.startsWith(PREFIX)

const evaluate = (name, msg) => {
  if (isCommand(msg)) {
    const tokens = msg.split(` `)
    if (tokens[0]) {
      const command = tokens[0].substring(1, tokens[0].length)
      switch (command) {
        case `roll`: {
          const input = tokens.slice(1, tokens.length).join(` `)
          return dice.roll(name, input)
        }
        case `set`: {
          const [,path, value] = tokens
          return gamestate.set(path, value)
        }
        case `get`: {
          const [,path] = tokens
          return gamestate.get(path)
        }
      }
    }
  }
}

export default {
  evaluate
}
