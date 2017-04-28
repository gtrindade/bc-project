import Inferno from 'inferno'
import createClass from 'inferno-create-class'
import io from 'socket.io-client'

const MESSAGE = `message`

const Chat = createClass({
  componentDidMount() {
    const socket = io()
    socket.on(MESSAGE, (msg) => {
      this.setState({
        ...this.state,
        history: this.state.history.concat(msg)
      })
    })
    this.setState({
      ...this.state,
      socket
    })

  },
  getInitialState: () => ({
    message: ``,
    name: ``,
    history: []
  }),
  handleSubmit() {
    const {message, name} = this.state
    this.setState({
      ...this.state,
      message: ``
    })
    this.state.socket.emit(`message`, message, name)
  },
  handleNameChange(e) {
    const {target: {value}} = e
    this.setState({
      ...this.state,
      name: value
    })
  },
  handleMessageChange(e) {
    const {key} = e
    const {target: {value}} = e
    this.setState({
      ...this.state,
      message: value
    })
    if (key === `Enter`) {
      this.handleSubmit()
    }
  },
  render() {
    const {history, message, name} = this.state
    return(
      <div>
        <h3>Chat</h3>
        <div className="chat-log">
          { history.map((msg) => <div>{msg}</div> )}
        </div>
        <input
          type="text"
          value={name}
          placeholder="Name..."
          onChange={this.handleNameChange}
        /> 
        <input
          type="text"
          value={message}
          placeholder="Message..."
          onKeyPress={this.handleMessageChange}
        />
        <input type="submit" value="submit" onClick={this.handleSubmit}/>
      </div>
    )
  }
})

export default Chat
