import {useEffect, useState} from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Hosts = () => {
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios('/api/hosts')
        setHosts(result.data.hosts);
        setLoading(false);
      } catch (error) {
        setError(error)
        navigate('/login')
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  return (
    <div className="hosts">
      <h1>Hosts</h1>
      <table>
        <thead>
          <tr>
            <th>Port</th>
            <th>Protocol</th>
            <th>Destination</th>
            <th>Destination Port</th>
          </tr>
        </thead>
        <tbody>
          {hosts.map((host) => (
            <tr key={host.port}>
              <td>{host.port}</td>
              <td>{host.protocol}</td>
              <td>{host.destination}</td>
              <td>{host.dport}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Hosts