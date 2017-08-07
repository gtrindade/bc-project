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

  formatMessage(name, message) {
    return `[${name}]: ${message}`
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

  renderLog(log, handler) {
    const renderer = ({name, msg, _id}, i) => (
      <div key={i} onClick={handler} id={_id}>
        {this.formatMessage(name, msg)}
      </div> 
    )
    return log.map(renderer)
  },

  render() {
    const {log, handleEdit} = this.props
    return (
      <div className="chat-log" ref="box">
        {this.renderLog(log, handleEdit)}
      </div>
    )
  }
})

export default ChatLog
