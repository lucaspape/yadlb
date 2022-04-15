import React, {useState} from 'react'
import axios from 'axios'
import {toast} from 'react-toastify'
import {useNavigate} from 'react-router-dom'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    let navigate = useNavigate()

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const credentials = {
            username: username,
            password: password
        }

        axios
            .post('/api/login', credentials)
            .then(() => {
                console.log('Logged in successfully')
                navigate('/')
            })
            .catch((error) => {
                console.log(error.response.data.message)

                toast.error('Login failed! Wrong password / username', {
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
        <>
            <main>
                <form id='register' onSubmit={handleSubmit}>
                    <h2 id='register__title'>Login</h2>
                    <label htmlFor='user'>
                        User
                        <i className='fas fa-asterisk'/>
                    </label>
                    <input
                        id='user'
                        className={'input'}
                        type='text'
                        maxLength={16}
                        minLength={4}
                        required
                        placeholder='Username'
                        onChange={handleUsernameChange}
                        value={username}
                    />
                    <br/>
                    <label htmlFor='password'>
                        Password
                        <i className='fas fa-asterisk'/>
                    </label>
                    <input
                        className={'input'}
                        id='password'
                        type='password'
                        minLength={6}
                        required
                        placeholder='Password'
                        onChange={handlePasswordChange}
                        value={password}
                    />
                    <br/>
                    <input
                        type='submit'
                        className={'input'}
                        value='Login'
                        id='register__btn'
                    />
                </form>
            </main>
        </>
    )
}

export default Login