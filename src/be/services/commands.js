import dice from './dice'

const PREFIX = `/`

const isCommand = (text) => text && text.startsWith(PREFIX)

const evaluate = (name, msg) => {
  if (isCommand(msg)) {
    const tokens = msg.split(` `)
    if (tokens[0]) {
      const command = tokens[0].substring(1, tokens[0].length)
      switch (command) {
        case `roll`: {
          return dice.roll(name, tokens.slice(1, tokens.length).join(` `))
        }
      }
    }
  }
}

export default {
  evaluate
}
