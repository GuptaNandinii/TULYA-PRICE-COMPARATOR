'use client'

import { useState } from 'react'
import { loginUser } from '@/app/actions/auth'
import { useAlert } from '@/components/providers/AlertProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function LoginForm() {
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const alert = useAlert()

    async function executeLogin(userEmail: string, userPass: string) {
        setLoading(true)
        setError('')

        const formData = new FormData()
        formData.append('email', userEmail)
        formData.append('password', userPass)

        const result = await loginUser(formData)

        if (result?.error) {
            setError(result.error)
            alert.error(result.error)
            setLoading(false)
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        await executeLogin(email, password)
    }

    async function handleAutoFillAndLogin() {
        if (isTyping || loading) return
        setIsTyping(true)
        setError('')
        setEmail('')
        setPassword('')

        const targetEmail = 'test@example.com'
        const targetPass = 'password123'

        // Smooth typing animation for email
        for (let i = 1; i <= targetEmail.length; i++) {
            setEmail(targetEmail.slice(0, i))
            await new Promise((r) => setTimeout(r, 25))
        }

        await new Promise((r) => setTimeout(r, 100))

        // Smooth typing animation for password
        for (let i = 1; i <= targetPass.length; i++) {
            setPassword(targetPass.slice(0, i))
            await new Promise((r) => setTimeout(r, 25))
        }

        await new Promise((r) => setTimeout(r, 150))
        setIsTyping(false)

        // Automatically trigger log in
        await executeLogin(targetEmail, targetPass)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-4 flex flex-col items-center gap-3">
                <p className="text-sm text-blue-900 font-medium">Want to test it out quickly?</p>
                <Button 
                    type="button" 
                    variant="secondary"
                    className="text-xs bg-white border border-blue-200 hover:bg-blue-50 hover:no-underline font-medium shadow-sm transition-all"
                    disabled={isTyping || loading}
                    onClick={handleAutoFillAndLogin}
                >
                    {isTyping ? 'Typing credentials...' : 'Auto-fill demo credentials & Log in'}
                </Button>
            </div>

            <div className="space-y-2">
                <Input 
                    name="email" 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={isTyping || loading}
                    required 
                />
                <Input 
                    name="password" 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={isTyping || loading}
                    required 
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" isLoading={loading}>
                Log in
            </Button>

            <div className="text-center text-sm">
                <span className="text-gray-500">Don't have an account? </span>
                <Link href="/register" className="font-medium underline underline-offset-4 hover:text-gray-900">
                    Sign up
                </Link>
            </div>
        </form>
    )
}
