import React from 'react'
import io from 'socket.io-client'
import {
  MESSAGE, MESSAGES, MESSAGES_FROM, UPDATE, DISCONNECT, CONNECT
} from '../constants'

export const unformatRegex = /\[(.*)\]:\ (.*)/

const LOAD_MORE = `Loading More...`
const BEGINNING = `The Beginning`

const Chat = React.createClass({
  getInitialState() {
    return {
      msg: ``,
      name: ``,
      history: [],
      loading: false,
      loadHistoryText: LOAD_MORE
    }
  },

  formatMessage(name, message) {
    return `[${name}]: ${message}`
  },

  handleScroll: function(event) {
    const {history, socket, loadHistoryText, loading} = this.state
    const {scrollTop} = event.target

    const [oldest] = history
    const atTop = scrollTop < 10
    const notBeginning = loadHistoryText !== BEGINNING
    const hasTime = oldest && oldest.time
    const notLoading = !loading

    if (atTop && hasTime && notBeginning && notLoading) {
      console.log(`will load`)
      this.setState({
        loading: true
      })
      setTimeout(() => {
        console.log(`loading`)
        socket.emit(MESSAGES_FROM, oldest.time)
      }, 2000)
    }
  },

  reset() {
    this.setState({
      _id: undefined,
      msg: ``
    })
  },

  clearHistory() {
    this.setState({
      history: []
    })
  },

  replaceHistory(messages) {
    this.setState({
      history: messages
    })
  },

  prependToHistory(messages) {
    console.log(`got the messages, prepending`)
    const {box} = this.refs

    const resultLength = messages && messages.length
    const loading = false
    const history = messages.concat(this.state.history)
    const loadHistoryText = resultLength > 0 ? LOAD_MORE : BEGINNING

    this.setState({
      loadHistoryText,
      history,
      loading
    }, () => {
      const {scrollHeight} = this.state

      console.log(`state scrollHeight`, scrollHeight)
      console.log(`box.offsetHeight`, box.offsetHeight)
      console.log(`box.scrollHeight`, box.scrollHeight)
      console.log(`box.scrollTop`, box.scrollTop)

      const deltaHeight = box.scrollHeight - scrollHeight
      box.scrollTop = deltaHeight
      this.setState({
        scrollHeight: box.scrollHeight,
      })
    })
  },

  appendToHistory(message) {
    this.setState({
      history: this.state.history.concat(message)
    }, () => {
      const {name} = this.state
      const {box} = this.refs

      const ownMessage = message.name === name
      const atBottom = box.scrollHeight - (box.scrollTop + box.offsetHeight) <= 40
      if (ownMessage || atBottom) {
        box.scrollTop = box.scrollHeight
      }
    })
  },

  updateHistory(message) {
    const {history} = this.state
    this.setState({
      history: history.map((log) => {
        if (log._id == message._id) {
          return message
        }
        return log
      })
    })
  },

  disconnectHandler() {
    this.clearHistory()
    this.setState({
      connected: false
    })
  },

  connectHandler() {
    this.setState({
      connected: true
    })
  },

  componentDidMount() {
    setTimeout(() => {
      const {box} = this.refs
      box.scrollTop = box.scrollHeight
    }, 100)
  },

  componentWillMount() {
    const socket = io()
    socket.on(MESSAGE, this.appendToHistory)
    socket.on(MESSAGES, this.replaceHistory)
    socket.on(MESSAGES_FROM, this.prependToHistory)
    socket.on(UPDATE, this.updateHistory)
    socket.on(DISCONNECT, this.disconnectHandler)
    socket.on(CONNECT, this.connectHandler)
    this.setState({ socket })
  },

  getLastMessage() {
    const {history, name} = this.state
    const length = history.length
    for (let i = length - 1; i >= 0; i--) {
      if (name === history[i].name) {
        return history[i]
      }
    }
  },

  handleSubmit() {
    const {msg, name, _id} = this.state
    const editMode = !!_id
    if (name && msg) {
      const {socket} = this.state
      const message = {name, msg, _id}
      if (editMode) {
        socket.emit(UPDATE, message)
        this.reset()
      } else {
        socket.emit(MESSAGE, message)
        this.setState({
          _id: undefined,
          scrollToBottom: true,
          msg: ``,
          name
        })
        setTimeout(() => {
          this.setState({
            scrollToBottom: false
          })
        }, 500)
      }
    }
  },

  handleNameChange(e) {
    const {target: {value}} = e
    this.setState({ name: value })
  },

  handleMessageChange(e) {
    const {target: {value}} = e
    this.setState({ msg: value })
  },

  handleKeyPress(e) {
    const {name, _id} = this.state
    const {key} = e
    let last
    switch (key) {
      case `ArrowUp`:
        if (!name) return
        last = this.getLastMessage()
        this.setState({
          name: last.name,
          msg: last.msg,
          _id: last._id
        }, () => {
          this.inputMessage.blur()
          setTimeout(() => {
            this.inputMessage.focus()
          }, 200)
        })
        break
      case `Enter`:
        this.handleSubmit()
        break
      case `Escape`:
        if (_id) {
          this.setState({ msg: ``, _id: undefined })
        }
        break
    }
  },

  handleEdit(e) {
    const {target} = e
    const [,name, msg] = target.innerHTML.match(unformatRegex)
    const {id} = target
    this.setState({ name, msg, _id: id})
    this.inputMessage.focus()
  },

  renderLog(log, handler) {
    const {socket} = this.state
    if (socket && socket.connected) {
      const {loadHistoryText} = this.state
      const renderer = ({name, msg, _id, response, editCount}, i) => (
        <div key={i}>
          <div>
            <span onClick={handler} id={_id}>
              {this.formatMessage(name, msg)}
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
  },

  render() {
    const {history, msg, name, _id} = this.state
    const editMode = !!_id
    const editClass = editMode ? `edit-mode` : ``

    return(
      <div className="chat-container">
        <h3>Chat</h3>
        <div onScroll={this.handleScroll} className="chat-log" ref="box">
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
})

export default Chat
