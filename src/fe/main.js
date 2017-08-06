import React from 'react'
import ReactDOM from 'react-dom'
import Chat from './chat/chat'

class App extends React.Component {
  render() {
    return(
      <div>
        <h1>BC Project</h1>
        <Chat/>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById(`bc-project`))
