import Inferno from 'inferno'
import createClass from 'inferno-create-class'
import Chat from './chat/chat'

const App = createClass({
  render(props, state) {
    return(
      <div>
        <h1>BC Project</h1>
        <Chat/>
      </div>
    )
  }
})

Inferno.render(<App />, document.getElementById(`bc-project`))
