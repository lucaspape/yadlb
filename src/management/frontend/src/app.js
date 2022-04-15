import { useNavigate } from 'react-router-dom'

function App() {
  let navigate = useNavigate()
  navigate('/hosts')

  return (
    <div className="App">
    </div>
  );
}

export default App;
