import {useEffect, useState} from "react"
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import Modal from 'react-modal'
import {toast} from "react-toastify"

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

Modal.setAppElement('#root');

const Hosts = () => {
    let subtitle

    const [hosts, setHosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [modalIsOpen, setIsOpen] = useState(false)
    const [port, setPort] = useState('')
    const [protocol, setProtocol] = useState('')
    const [destination, setDestination] = useState('')
    const [destinationPort, setDestinationPort] = useState('')

    const navigate = useNavigate()

    const loadHosts = () => {
        setLoading(true)

        const fetchData = async () => {
            try {
                const result = await axios('/api/hosts')
                setHosts(result.data.hosts)
                setLoading(false)
            } catch (error) {
                setError(error)
                navigate('/login')
            }
        }
        fetchData()
    }

    useEffect(() => {
        loadHosts()
    }, [navigate])

    if (loading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>Error: {error.message}</p>
    }

    function openModal() {
        setIsOpen(true)
    }

    function afterOpenModal() {
        subtitle.style.color = '#f00'
    }

    function closeModal() {
        setIsOpen(false)
    }

    const handlePortChange = (event) => {
        setPort(event.target.value)
    }

    const handleProtocolChange = (event) => {
        setProtocol(event.target.value)
    }

    const handleDestinationChange = (event) => {
        setDestination(event.target.value)
    }

    const handleDestinationPortChange = (event) => {
        setDestinationPort(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const data = {
            port: Number(port),
            protocol: protocol,
            destination: destination,
            dport: Number(destinationPort)
        }

        axios
            .post('/api/host', data)
            .then((response) => {
                console.log(response.data)
                closeModal()

                toast.info('Host added successfully!', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined
                })

                loadHosts()
            })
            .catch((error) => {
                console.log(error.response.data.message)

                toast.error('Failed to add host', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined
                })
            })
    }

    const deleteHost = (host) => {
        axios
            .delete('/api/host?port=' + host.port)
            .then((response) => {
                console.log(response.data)
                closeModal()

                toast.info('Host deleted successfully!', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined
                })

                loadHosts()
            })
            .catch((error) => {
                console.log(error.response.data.message)

                toast.error('Failed to delete host', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined
                })
            })
    }

    return (
        <div className="hosts">
            <h1>Hosts</h1>
            <button onClick={openModal}>Create host</button>
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Create Host"
            >
                <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Create Host</h2>
                <form id='add_host' onSubmit={handleSubmit}>
                    <label htmlFor='port'>
                        Port
                    </label>
                    <input
                        id='port'
                        className={'input'}
                        type='text'
                        required
                        placeholder='8080'
                        onChange={handlePortChange}
                        value={port}
                    />
                    <br/>
                    <label htmlFor='protocol'>
                        Protocol
                    </label>
                    <input
                        className={'input'}
                        id='protocol'
                        type='text'
                        required
                        placeholder='tcp/udp'
                        onChange={handleProtocolChange}
                        value={protocol}
                    />
                    <br/>
                    <label htmlFor='destination'>
                        Destination
                    </label>
                    <input
                        className={'input'}
                        id='destination'
                        type='text'
                        required
                        placeholder='127.0.0.1'
                        onChange={handleDestinationChange}
                        value={destination}
                    />
                    <br/>
                    <label htmlFor='destination-port'>
                        Destination Port
                    </label>
                    <input
                        className={'input'}
                        id='destination-port'
                        type='text'
                        required
                        placeholder='127.0.0.1'
                        onChange={handleDestinationPortChange}
                        value={destinationPort}
                    />
                    <br/>
                    <input
                        type='submit'
                        className={'input'}
                        value='Add host'
                        id='add_host__btn'
                    />
                </form>
                <button onClick={closeModal}>close</button>
            </Modal>
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
                        <td><button onClick={() => {deleteHost(host)}}>Delete</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default Hosts