'use client'

import { useState } from 'react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    const res = await fetch('http://localhost:8080/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })

    if (!res.ok) {
        const errorText = await res.text(); 
        throw new Error(`Signup failed: ${errorText}`);
    }

    const data = await res.json()
    if (res.ok) {
        setMessage('Signup successful! You can now log in.')
    } else {
        setMessage(data.error || 'Signup failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <input
        className="w-full p-2 mb-2 border"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 mb-2 border"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full p-2 mb-2 border"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="w-full bg-blue-500 text-white p-2 rounded"
        onClick={handleSignup}
      >
        Sign Up
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  )
}