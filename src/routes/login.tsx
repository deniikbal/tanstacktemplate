import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, ArrowLeft, ShieldCheck, Mail, Lock } from 'lucide-react'
import LoginForm from '@/components/shadcn-studio/blocks/login-page-01/login-form'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* ── Aurora Mesh Gradient Background ──────────────── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-100/30 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-slate-200/50 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="w-full max-w-5xl px-4 grid lg:grid-cols-5 gap-0 items-center animate-in fade-in zoom-in duration-700">
        
        {/* ── Left Branding (lg only) ─────────────────────── */}
        <div className="hidden lg:flex lg:col-span-2 flex-col justify-center p-12 space-y-8">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/40 group-hover:scale-110 transition-transform duration-500 transform -rotate-6 group-hover:rotate-0">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <span className="font-black text-3xl tracking-tighter text-slate-900">
              SPMB <span className="text-amber-500">2026</span>
            </span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Gerbang <br /> 
              <span className="text-amber-500">Masa Depan</span> <br />
              Dimulai Di Sini.
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-xs leading-relaxed">
              Masuk ke sistem pendaftaran resmi SMAN 1 Bantarujeg.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-slate-400 group">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
                <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Sistem Terenkripsi & Aman</span>
            </div>
          </div>
        </div>

        {/* ── Right Login Card ────────────────────────────── */}
        <div className="col-span-1 lg:col-span-3">
          <Card className="relative z-10 border-white/40 bg-white/70 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[40px] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
            
            <CardContent className="p-8 sm:p-12 md:p-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                  <div className="lg:hidden flex items-center gap-2 mb-4">
                    <GraduationCap className="w-6 h-6 text-amber-500" />
                    <span className="font-black text-xl text-slate-900">SPMB 2026</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Login Akun</h2>
                  <p className="text-slate-500 font-medium italic">Silakan lengkapi formulir di bawah ini</p>
                </div>
                
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-amber-600 transition-colors group px-4 py-2 bg-slate-100 rounded-full hover:bg-amber-50"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Beranda
                </Link>
              </div>

              <LoginForm />

              <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                  SMAN 1 BANTARUJEG
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4">Butuh Bantuan?</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
