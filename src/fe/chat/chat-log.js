import React from 'react'
import {MESSAGES_FROM} from '../constants'

const LOAD_MORE = `More...`
const BEGINNING = `The Beginning`

const ChatLog = React.createClass({
  propTypes: {
    log: React.PropTypes.array.isRequired
  },

  getInitialState() {
    return {
      loading: false,
      scrollTop: 0,
      loadHistoryText: LOAD_MORE
    }
  },

  formatMessage(name, message) {
    return `[${name}]: ${message}`
  },

  handleMessagesFrom(result) {
    if (result && result.length > 0) {
      const {box} = this.refs
      box.scrollTop = 200
      this.setState({loadHistoryText: LOAD_MORE})
    } else {
      this.setState({loadHistoryText: BEGINNING})
    }
  },

  componentDidUpdate() {
    const {box} = this.refs
    const {socket} = this.props
    if (this.shouldAutoScroll) {
      box.scrollTop = box.scrollHeight
    }
    socket.on(MESSAGES_FROM, this.handleMessagesFrom)
  },

  handleScroll: function(event) {
    const {log, socket} = this.props
    const {loadHistoryText} = this.state
    const {scrollTop} = event.target

    const [oldest] = log
    const atTop = scrollTop < 10
    const notBeginning = loadHistoryText !== BEGINNING
    const hasTime = oldest && oldest.time

    if (atTop && hasTime && notBeginning) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        socket.emit(MESSAGES_FROM, oldest.time)
      }, 1000)
    }
  },

  componentWillUpdate() {
    const {box} = this.refs
    this.shouldAutoScroll = box.scrollHeight - (box.scrollTop + box.offsetHeight) <= 10
  },

  renderLog(log, handler) {
    const {socket} = this.props
    if (socket && socket.connected) {
      const {loadHistoryText} = this.state
      const renderer = ({name, msg, _id}, i) => (
        <div key={i} onClick={handler} id={_id}>
          {this.formatMessage(name, msg)}
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
    const {log, handleEdit} = this.props
    return (
      <div onScroll={this.handleScroll} className="chat-log" ref="box">
        {this.renderLog(log, handleEdit)}
      </div>
    )
  }
})

export default ChatLog
