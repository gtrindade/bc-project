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
    const {box} = this.refs
    const {scrollHeight} = this.state
    const deltaHeight = box.scrollHeight - scrollHeight
    if (result && result.length > 0) {
      const atTop = box.scrollTop < 10
      if (atTop) {
        box.scrollTop = deltaHeight
      }
      this.setState({
        loadHistoryText: LOAD_MORE,
        scrollHeight: box.scrollHeight,
        loading: false
      })
    } else {
      this.setState({
        loadHistoryText: BEGINNING,
        loading: false
      })
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
    const {loadHistoryText, loading} = this.state
    const {scrollTop} = event.target

    const [oldest] = log
    const atTop = scrollTop < 10
    const notBeginning = loadHistoryText !== BEGINNING
    const hasTime = oldest && oldest.time
    const notLoading = !loading

    if (atTop && hasTime && notBeginning && notLoading) {
      socket.emit(MESSAGES_FROM, oldest.time)
      this.setState({
        loading: true
      })
    }
  },

  componentWillUpdate() {
    const {box} = this.refs
    this.shouldAutoScroll = box.scrollHeight - (box.scrollTop + box.offsetHeight) <= 10
  },

  componentDidMount() {
    const {box} = this.refs
    this.setState({
      scrollHeight: box.scrollHeight
    })
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
