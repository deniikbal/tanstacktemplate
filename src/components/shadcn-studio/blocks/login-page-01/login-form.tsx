'use client'

import { useState } from 'react'
import { EyeIcon, EyeOffIcon, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

const LoginForm = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      toast.error(error.message || 'Login failed')
    } else {
      toast.success('Login successful')
      navigate({ to: '/dashboard' })
    }
    setLoading(false)
  }

  return (
    <form className='space-y-6' onSubmit={handleLogin}>
      {/* Email */}
      <div className='space-y-2'>
        <Label htmlFor='userEmail' className='text-sm font-bold text-slate-700 ml-1'>
          Email address
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <Input
            type='email'
            id='userEmail'
            placeholder='nama@email.com'
            className='pl-11 h-12 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className='w-full space-y-2'>
        <div className="flex items-center justify-between ml-1">
          <Label htmlFor='password' title='Password' className="text-sm font-bold text-slate-700">
            Password
          </Label>
        </div>
        <div className='relative group'>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <Input
            id='password'
            type={isVisible ? 'text' : 'password'}
            placeholder='••••••••••••'
            className='pl-11 pr-12 h-12 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setIsVisible(prevState => !prevState)}
            className='absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-amber-600 transition-colors focus:outline-none'
            aria-label={isVisible ? 'Hide password' : 'Show password'}
          >
            {isVisible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
      </div>

      <Button 
        className='w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black h-14 rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group' 
        type='submit' 
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            Masuk Sekarang
          </span>
        )}
      </Button>
    </form>
  )
}

export default LoginForm
