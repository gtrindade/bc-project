import React from 'react'
import io from 'socket.io-client'
import {colors} from './color-util'
import {
  MESSAGE, MESSAGES, MESSAGES_FROM, UPDATE, DISCONNECT, CONNECT
} from '../constants'

const LOAD_MORE = `Loading More...`
const BEGINNING = `The Beginning`
const HEIGHT_THRESHOLD = 40
const REDRAW_DELAY = 300
const LOAD_HISTORY_DELAY = 500

const initialState = {
  msg: ``, // The message that will be sent
  name: ``, // The name defined by user
  history: [], // All the messages in the history
  loadHistoryText: LOAD_MORE, // The message on the top before/after loading history
  scrollHeight: 0, // Keeping the scrollHeight since last render
  colorMap: {}, // A Map from names to colors
  hidden: false, // Is the tab focused or not?
  newMessages: 0 // How many new messages since tab was made hidden?
}

class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }

  newMessageWatcher = () => {
    const {newMessages} = this.state
    document.title = `${newMessages ? `(${newMessages}) ` : ``}BC Project`
    if (!document.hidden) {
      this.setState({hidden: false, newMessages: 0})
    } else {
      this.setState({hidden: true})
    }
  }

  clearNewMessages = () => {
    setTimeout(() => {
      const {history} = this.state
      const length = history.length
      for (let i = length - 1; i >= 0; i--) {
        if (history[i].newClassName) {
          delete history[i].newClassName
        }
      }
    }, REDRAW_DELAY)
  }

  handleScroll = (event) => {
    const {history, socket, loadHistoryText, loading} = this.state
    const {scrollTop} = event.target

    const [oldest] = history
    const atTop = scrollTop < HEIGHT_THRESHOLD
    const notBeginning = loadHistoryText !== BEGINNING
    const hasTime = oldest && oldest.time
    const notLoading = !loading

    if (atTop && hasTime && notBeginning && notLoading) {
      this.setState({ loading: true })
      setTimeout(() => socket.emit(MESSAGES_FROM, oldest.time), LOAD_HISTORY_DELAY)
    }
  }

  exitEditMode = () => {
    this.setState({ _id: undefined, msg: `` })
  }

  clearMessage = () => {
    this.setState({ msg: `` })
  }

  replaceHistory = (messages) => {
    this.setState({ history: messages })
  }

  clearHistory = () => {
    this.replaceHistory([])
  }

  delayedScrollToBottom = () => {
    setTimeout(() => { this.box.scrollTop = this.box.scrollHeight }, REDRAW_DELAY)
  }

  updateNewMessages = (message) => {
    if (document.hidden) {
      message.newClassName = `new-message`
      this.setState({ newMessages: this.state.newMessages + 1 })
      if (Notification) {
        new Notification(`${message.name}: ${message.msg}`)
      }
    } else {
      this.setState({ newMessages: 0 })
    }
  }

  prependToHistory = (messages) => {
    const resultLength = messages && messages.length
    const loadHistoryText = resultLength > 0 ? LOAD_MORE : BEGINNING
    const history = messages.concat(this.state.history)
    messages.map((message) => this.updateColorMap(message.name))

    this.setState({ loadHistoryText, history, loading: false }, () => {
      const {scrollHeight} = this.box
      const deltaHeight = scrollHeight - this.state.scrollHeight
      this.box.scrollTop = deltaHeight

      this.setState({ scrollHeight })
    })
  }

  appendToHistory = (message) => {
    const history = this.state.history.concat(message)
    this.updateColorMap(message.name)
    this.updateNewMessages(message)
    this.setState({ history }, () => {
      const {name} = this.state
      const {scrollHeight, scrollTop, offsetHeight} = this.box

      const ownMessage = message.name === name
      const atBottom = scrollHeight - (scrollTop + offsetHeight) <= HEIGHT_THRESHOLD
      if (ownMessage || atBottom) {
        this.delayedScrollToBottom()
      }
    })
  }

  updateHistory = (message) => {
    const {history} = this.state
    const historyLength = history.length
    this.updateNewMessages(message)
    const newHistory = history.map((log, index) => {
      if (log._id === message._id) {
        if (index === historyLength - 1) {
          this.delayedScrollToBottom()
        }
        this.updateColorMap(message.name)
        return message
      }
      return log
    })

    this.setState({ history: newHistory })
  }

  updateColorMap = (name) => {
    const {colorMap} = this.state
    if (colorMap[name]) {
      return colorMap[name]
    }
    
    const current = Object.keys(colorMap).length
    colorMap[name] = colors[current % colors.length]
    this.setState({colorMap})
  }

  disconnectHandler = () => {
    this.clearHistory()
    this.setState({ connected: false })
  }

  connectHandler = () => {
    this.setState({ connected: true })
    this.delayedScrollToBottom()
  }

  componentWillMount = () => {
    const socket = io()
    socket.on(MESSAGE, this.appendToHistory)
    socket.on(MESSAGES, this.replaceHistory)
    socket.on(MESSAGES_FROM, this.prependToHistory)
    socket.on(UPDATE, this.updateHistory)
    socket.on(DISCONNECT, this.disconnectHandler)
    socket.on(CONNECT, this.connectHandler)
    this.setState({ socket })
    setInterval(this.newMessageWatcher, 1000)
    document.addEventListener(`visibilitychange`, () => {
      this.setState({hidden: document.hidden})

      if (!document.hidden) {
        this.clearNewMessages()
      }
    })
  }

  getLastMessage = () => {
    const {history, name} = this.state
    const length = history.length
    for (let i = length - 1; i >= 0; i--) {
      if (name === history[i].name) {
        return history[i]
      }
    }
  }

  handleSubmit = () => {
    const {msg, name, _id, socket} = this.state

    if (name && msg) {
      const editMode = !!_id
      const message = {name, msg, _id}

      if (editMode) {
        socket.emit(UPDATE, message)
        this.exitEditMode()
      } else {
        socket.emit(MESSAGE, message)
        this.clearMessage()
      }
    }
  }

  handleNameChange = (e) => {
    const {target: {value}} = e
    this.setState({ name: value })
  }

  handleMessageChange = (e) => {
    const {target: {value}} = e
    this.setState({ msg: value })
  }

  handleKeyPress = (e) => {
    const {name, _id} = this.state
    const {key} = e
    switch (key) {
      case `ArrowUp`: {
        if (!name) return

        const last = this.getLastMessage()
        this.setState({...last}, () => {
          this.inputMessage.blur()
          setTimeout(() => { this.inputMessage.focus() }, REDRAW_DELAY)
        })
        break
      }
      case `Enter`: {
        this.handleSubmit()
        break
      }
      case `Escape`: {
        if (_id) {
          this.exitEditMode()
        }
        break
      }
    }
  }

  handleEdit = (e) => {
    const {target} = e
    const {id: _id} = target
    const {name, msg} = this.findById(_id)

    this.setState({ name, msg, _id})
    this.inputMessage.focus()
  }

  findById = (id) => {
    const {history} = this.state
    const length = history.length
    for (let i = length - 1; i >= 0; i--) {
      if (id === history[i]._id) {
        return history[i]
      }
    }
  }

  renderLog = (log, handler) => {
    const {socket, loadHistoryText, colorMap} = this.state

    if (socket && socket.connected) {
      const renderer = ({name, msg, _id, response, editCount, newClassName}, i) => (
        <div key={i} className={newClassName}>
          <div>
            <span onClick={handler} id={_id}>
              [<span style={{color: colorMap[name]}}>{name}</span>]: {msg}
            </span>
            {response && editCount ? <i className="edit-count">{editCount}</i> : null}
          </div>
          {response ? <pre className="response">{response}</pre> : null}
        </div>
      )
      return (
        <div>
          <div className="load-history">{loadHistoryText}</div>
          {log.map(renderer)}
        </div>
      )
    }
    return <div>Connecting...</div>
  }

  render() {
    const {history, msg, name, _id} = this.state
    const editMode = !!_id
    const editClass = editMode ? `edit-mode` : ``

    return(
      <div className="chat-container">
        <h3>Chat</h3>
        <div
          onScroll={this.handleScroll}
          className="chat-log"
          ref={(ref) => {this.box = ref}}
        >
          {this.renderLog(history, this.handleEdit)}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={name}
            placeholder="Name"
            onChange={this.handleNameChange}
            className={`name-field ${editClass}`}
          /> 
          <input
            type="text"
            value={msg}
            placeholder="Message"
            onChange={this.handleMessageChange}
            onKeyDown={this.handleKeyPress}
            className={`message-field ${editClass}`}
            ref={(ref) => {this.inputMessage = ref}}
          />
          <input
            type="submit"
            value={editMode ? `UPDATE` : `SEND`}
            onClick={this.handleSubmit}
            className="submit-button"
          />
        </div>
      </div>
    )
  }
}

export default Chat
