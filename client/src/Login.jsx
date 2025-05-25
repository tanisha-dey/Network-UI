import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')  // <-- error state
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('') // clear previous error
    axios.post('http://localhost:3001/login', { email, password })
      .then(result => {
        if (result.data === 'Success') {
          navigate('/home')
        } else {
          setError('Wrong email or password entered!')  // Show error if not success
        }
      })
      .catch(err => {
        setError('Login failed. Please try again later.') // Network or server error
        console.log(err)
      })
  }

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email"><strong>Email</strong></label>
            <input
              type="text"
              placeholder="Enter email"
              autoComplete="off"
              name="email"
              className="form-control rounded-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password"><strong>Password</strong></label>
            <input
              type="password"
              placeholder="Enter password"
              autoComplete="off"
              name="password"
              className="form-control rounded-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100 rounded-0">Login</button>
          <p className="mt-2">New User? <Link to="/register">Register</Link></p>
        </form>

        {/* Show error popup/message here */}
        {error && (
          <div
            className="alert alert-danger mt-3"
            role="alert"
            style={{ fontWeight: 'bold' }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login;
