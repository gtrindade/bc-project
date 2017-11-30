import React from 'react'
import io from 'socket.io-client'
import ChatLog from './chat-log'
import {
  MESSAGE, MESSAGES, MESSAGES_FROM, UPDATE, DISCONNECT, CONNECT
} from '../constants'

export const unformatRegex = /\[(.*)\]:\ (.*)/

const Chat = React.createClass({
  getInitialState() {
    return {
      msg: ``,
      name: ``,
      history: []
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
    this.setState({
      history: [...messages, ...this.state.history]
    })
  },

  appendToHistory(message) {
    this.setState({
      history: this.state.history.concat(message)
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

  render() {
    const {history, msg, name, _id, socket, scrollToBottom} = this.state
    const editMode = !!_id
    const editClass = editMode ? `edit-mode` : ``

    return(
      <div className="chat-container">
        <h3>Chat</h3>
        <ChatLog
          log={history}
          handleEdit={this.handleEdit}
          socket={socket}
          scrollToBottom={scrollToBottom}
        />
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
