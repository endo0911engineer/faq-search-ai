'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react"


export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const handleSignup = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/signup`, {
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
        router.push('/login') 
      }
    } catch (error) {
        setMessage('Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your details to create your new account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e:ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e:ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleSignup}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </Button>

          {message && (
            <Alert
              className={message.includes("successfully") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
            >
              <AlertDescription className={message.includes("successfully") ? "text-green-800" : "text-red-800"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}