import Inferno from 'inferno'
import createClass from 'inferno-create-class'

const App = createClass({
  componentDidMount() {
    console.log(`component mounted`)
  },
  render(props, state) {
    return(
      <div>
        <h1>BC Project</h1>
      </div>
    )
  }
})

Inferno.render(<App />, document.getElementById(`bc-project`))
