import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, ArrowLeft, ShieldCheck, Mail, Lock } from 'lucide-react'
import LoginForm from '@/components/shadcn-studio/blocks/login-page-01/login-form'
import { authClient } from '@/lib/auth-client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && session) {
      navigate({ to: '/dashboard', replace: true })
    }
  }, [session, isPending, navigate])

  if (isPending) return <LoadingSpinner />
  if (session) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* ── Aurora Mesh Gradient Background ──────────────── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-100/30 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-slate-200/50 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="w-full max-w-[440px] px-4 flex flex-col animate-in fade-in zoom-in duration-700">
        
        {/* ── Top Branding ────────────────────────────────── */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500 transform -rotate-3 group-hover:rotate-0">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900">
              SPMB <span className="text-amber-500">2026</span>
            </span>
          </Link>
          <p className="text-slate-500 font-medium text-sm text-center">
            Pendaftaran Resmi SMAN 1 Bantarujeg
          </p>
        </div>

        {/* ── Login Card ──────────────────────────────────── */}
        <Card className="relative z-10 border-white/60 bg-white/80 backdrop-blur-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
          
          <CardContent className="p-6 sm:p-10">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Login Akun</h2>
                <p className="text-slate-400 text-xs font-medium">Masuk untuk melanjutkan</p>
              </div>
              
              <Link 
                to="/" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors group px-3 py-1.5 bg-slate-100/50 rounded-full hover:bg-amber-50"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                Beranda
              </Link>
            </div>

            <LoginForm />

            <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                SMAN 1 BANTARUJEG
              </p>
              <a href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4">Bantuan?</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
