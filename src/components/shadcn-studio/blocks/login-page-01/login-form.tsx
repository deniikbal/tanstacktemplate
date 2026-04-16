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
    <form className='space-y-4' onSubmit={handleLogin}>
      {/* Email */}
      <div className='space-y-1.5'>
        <Label htmlFor='userEmail' className='text-xs font-bold text-slate-700 ml-1'>
          Email address
        </Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <Input
            type='email'
            id='userEmail'
            placeholder='nama@email.com'
            className='pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all text-sm'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className='w-full space-y-1.5'>
        <div className="flex items-center justify-between ml-1">
          <Label htmlFor='password' title='Password' className="text-xs font-bold text-slate-700">
            Password
          </Label>
        </div>
        <div className='relative group'>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <Input
            id='password'
            type={isVisible ? 'text' : 'password'}
            placeholder='••••••••••••'
            className='pl-10 pr-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all text-sm'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setIsVisible(prevState => !prevState)}
            className='absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-600 transition-colors focus:outline-none'
            aria-label={isVisible ? 'Hide password' : 'Show password'}
          >
            {isVisible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
      </div>

      <Button 
        className='w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black h-12 rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group text-sm' 
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
