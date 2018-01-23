import dice from '../dice/dice'
import gamestate from '../game-state/game-state'
import multikiew from '../multi-kiew/multi-kiew'

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
      let promise, shouldSave = true
      switch (command) {
        case `roll`: {
          const input = tokens.slice(1, tokens.length).join(` `)
          promise = dice.roll(input)
          break
        }
        case `set`: {
          const [,path, ...value] = tokens
          promise = gamestate.set(path, value.join(` `))
          break
        }
        case `get`: {
          const [,path] = tokens
          promise = gamestate.get(path)
          break
        }
        case `unset`: {
          const [,path] = tokens
          promise = gamestate.unset(path)
          break
        }
        case `ping`: {
          const [,...message] = tokens
          promise = multikiew.sendMessage(message.join(` `))
          shouldSave = false
          break
        }
      }
      return { shouldSave, promise }
    }
  }
}

const isHidden = msg => isHiddenCommand(msg)

export default {
  evaluate,
  isHidden
}
