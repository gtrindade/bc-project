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
      name: ``,
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

  handleSubmit() {
    const {msg, name, _id} = this.state
    const editMode = !!_id
    if (name) {
      const {socket} = this.state
      const message = {name, msg, _id}
      if (editMode) {
        socket.emit(UPDATE, message)
        this.reset()
      } else {
        socket.emit(MESSAGE, message)
        this.setState({
          msg: ``,
          name: name,
          _id: undefined
        })
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
    const {key} = e
    if (key === `Enter`) {
      this.handleSubmit()
    }
    if (key === `Escape`) {
      this.setState({ name: ``, msg: ``, _id: undefined })
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
    const {history, msg, name, _id, socket} = this.state
    const editMode = !!_id
    const editClass = editMode ? `edit-mode` : ``

    return(
      <div>
        <h3>Chat</h3>
        <ChatLog log={history} handleEdit={this.handleEdit} socket={socket}/>
        <div className="input-container">
          <input
            type="text"
            value={name}
            placeholder="Name..."
            onChange={this.handleNameChange}
            className={`name-field ${editClass}`}
          /> 
          <input
            type="text"
            value={msg}
            placeholder="Message..."
            onChange={this.handleMessageChange}
            onKeyDown={this.handleKeyPress}
            className={`message-field ${editClass}`}
            ref={(ref) => {this.inputMessage = ref}}
          />
          <input
            type="submit"
            value={editMode ? `update` : `submit`}
            onClick={this.handleSubmit}
            className="submit-button"
          />
        </div>
      </div>
    )
  }
})

export default Chat
