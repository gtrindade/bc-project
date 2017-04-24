import Inferno from 'inferno'
import createClass from 'inferno-create-class'

const Chat = createClass({
  getInitialState: () => ({
    message: ``,
    history: []
  }),
  handleChange(e) {
    const {target: {value}} = e
    this.setState({
      ...this.state,
      message: value
    })
  },
  handleSubmit() {
    const {history, message} = this.state
    this.setState({
      message: ``,
      history: history.concat(message)
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
        <form action="#" onSubmit={this.handleSubmit}>
          <input type="text" value={message} onChange={this.handleChange}/>
          <input type="submit" value="submit"/>
        </form>
      </div>
    )
  }
})

export default Chat
