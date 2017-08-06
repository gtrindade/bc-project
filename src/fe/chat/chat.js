import React from 'react'
import io from 'socket.io-client'
import ChatLog from './chat-log'

const MESSAGE = `message`

const Chat = React.createClass({
  getInitialState() {
    return {
      message: ``,
      name: ``,
      history: []
    }
  },

  componentDidMount() {
    const socket = io()
    socket.on(MESSAGE, (msg) => {
      this.setState({
        history: this.state.history.concat(msg)
      })
    })
    this.setState({ socket })
  },

  handleSubmit() {
    const {message, name} = this.state
    if (name) {
      this.state.socket.emit(`message`, name, message)
      this.setState({ message: `` })
    }
  },

  handleNameChange(e) {
    const {target: {value}} = e
    this.setState({ name: value })
  },

  handleMessageChange(e) {
    const {target: {value}} = e
    this.setState({ message: value })
  },

  handleKeyPress(e) {
    const {key} = e
    if (key === `Enter`) {
      this.handleSubmit()
    }
  },

  render() {
    const {history, message, name} = this.state

    return(
      <div>
        <h3>Chat</h3>
        <ChatLog log={history}/>
        <div className="input-container">
          <input
            type="text"
            value={name}
            placeholder="Name..."
            onChange={this.handleNameChange}
            className="name-field"
          /> 
          <input
            type="text"
            value={message}
            placeholder="Message..."
            onChange={this.handleMessageChange}
            onKeyDown={this.handleKeyPress}
            className="message-field"
          />
          <input
            type="submit"
            value="submit"
            onClick={this.handleSubmit}
            className="submit-button"
          />
        </div>
      </div>
    )
  }
})

export default Chat
