import React from 'react'
import ReactDOM from 'react-dom'
import Chat from './chat/chat'

class App extends React.Component {
  logoutHandler = () => {
    if (window.confirm(`Do you want to logout from your google account?`)) {
      window.open(`https://accounts.google.com/Logout`) 
      setTimeout(() => {
        window.location = `/logout`
      }, 3000)
    }
  }

  render() {
    return(
      <div className="bc-project">
        <div className="chat-header">
          <span onClick={this.logoutHandler} className="logout-button" >Logout</span>
        </div>
        <div className="chat-page">
          <Chat/>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById(`bc-project`))
