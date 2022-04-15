import {useEffect} from "react"
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/hosts')
  })

  return (
    <div className="App">
    </div>
  );
}

export default App;
