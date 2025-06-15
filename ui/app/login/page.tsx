'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token)
      setMessage('Login successful!')

      router.push('/dashboard')
    } else {
      setMessage(data.error || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input
        className="w-full p-2 mb-2 border"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 mb-2 border"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="w-full bg-green-500 text-white p-2 rounded"
        onClick={handleLogin}
      >
        Login
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  )
}