import Inferno from 'inferno'
import createClass from 'inferno-create-class'

const Chat = createClass({
  getInitialState: () => ({
    message: ``,
    history: []
  }),
  handleSubmit() {
    const {history, message} = this.state
    this.setState({
      message: ``,
      history: history.concat(message)
    })
  },
  handleKeyPress(e) {
    const {key} = e
    console.log(`state`, this.state)
    if (key === `Enter`) {
      this.handleSubmit()
    }
    const {target: {value}} = e
    this.setState({
      ...this.state,
      message: value
    })
  },
  render() {
    const {history, message} = this.state
    return(
      <div>
        <h3>Chat</h3>
        <div className="chat-log">
          { history.map((msg) => <div>{msg}</div> )}
        </div>
        <input
          type="text"
          value={message}
          onKeyPress={this.handleKeyPress}
        />
        <input type="submit" value="submit" onClick={this.handleSubmit}/>
      </div>
    )
  }
})

export default Chat
