import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './app';
import Hosts from './pages/hosts/hosts'
import Login from './pages/login/login'

ReactDOM.render(
    <>
        <BrowserRouter>
            <ToastContainer
                theme={'dark'}
                position='top-right'
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<Login />} />
                <Route path="/hosts" element={<Hosts />} />
                <Route path={'/error'} element={<App />} />
                <Route
                    path={'*'}
                    element={<Navigate to={'/error'} replace />}
                />
            </Routes>
        </BrowserRouter>
    </>, document.getElementById('root'))