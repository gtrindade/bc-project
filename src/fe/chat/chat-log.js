import React from 'react'

const ChatLog = React.createClass({
  propTypes: {
    log: React.PropTypes.array.isRequired
  },

  getInitialState() {
    return {
      scrollTop: 0
    }
  },

  componentDidUpdate() {
    const {box} = this.refs
    if (this.shouldAutoScroll) {
      box.scrollTop = box.scrollHeight
    }
  },

  componentWillUpdate() {
    const {box} = this.refs
    this.shouldAutoScroll = box.scrollHeight - (box.scrollTop + box.offsetHeight) <= 10
  },

  render() {
    const {log} = this.props
    return (
      <div className="chat-log" ref="box">
        { log.map((msg, i) => <div key={i}>{msg}</div> )}
      </div>
    )
  }
})

export default ChatLog
