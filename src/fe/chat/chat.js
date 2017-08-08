import React from 'react'
import io from 'socket.io-client'
import ChatLog from './chat-log'

const MESSAGE = `message`
const MESSAGES = `messages`
const UPDATE = `update`
const unformatRegex = /\[(.*)\]:\ (.*)/

const Chat = React.createClass({
  getInitialState() {
    return {
      msg: ``,
      name: ``,
      history: []
    }
  },

  replaceHistory(message) {
    this.setState({
      history: message
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

  componentDidMount() {
    const socket = io()
    socket.on(MESSAGE, this.appendToHistory)
    socket.on(MESSAGES, this.replaceHistory)
    socket.on(UPDATE, this.updateHistory)
    this.setState({ socket })
  },

  handleSubmit() {
    const {msg, name, _id} = this.state
    const editMode = !!_id
    if (name) {
      const action = editMode ? UPDATE : MESSAGE
      this.state.socket.emit(action, {name, msg, _id})
      const newName = editMode ? `` : name
      this.setState({
        msg: ``,
        name: newName,
        _id: undefined
      })
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
  },

  handleEdit(e) {
    const {target} = e
    const [,name, msg] = target.innerHTML.match(unformatRegex)
    const {id} = target
    this.setState({ name, msg, _id: id})
  },

  render() {
    const {history, msg, name, _id} = this.state
    const editMode = !!_id
    const editClass = editMode ? `edit-mode` : ``

    return(
      <div>
        <h3>Chat</h3>
        <ChatLog log={history} handleEdit={this.handleEdit}/>
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
