import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { loginStudent } from '@/lib/server/student-auth'

export const Route = createFileRoute('/student-login')({
    component: StudentLoginPage,
})

function StudentLoginPage() {
    const [nisn, setNisn] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nisn) {
            toast.error('Masukkan NISN Anda')
            return
        }

        setIsLoading(true)
        try {
            const result = await loginStudent({ data: { nisn } })

            // Set cookie on client side
            const sessionJson = JSON.stringify(result.session)
            const encoded = encodeURIComponent(sessionJson)
            document.cookie = `student_session=${encoded}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

            toast.success('Login berhasil! Selamat datang.')
            navigate({ to: '/student-dashboard' as any })
        } catch (error: any) {
            toast.error(error.message || 'NISN tidak terdaftar atau terjadi kesalahan')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
            {/* Soft decorative background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-50 blur-3xl opacity-50" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-50 blur-3xl opacity-50" />
            </div>

            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-medium text-sm">
                <ArrowLeft className="w-4 h-4" />
                Kembali
            </Link>

            <div className="w-full max-w-[400px] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-sm flex items-center justify-center shadow-lg shadow-blue-200">
                        <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Portal Siswa</h1>
                        <p className="text-sm text-slate-500">Masuk untuk melihat pengumuman & berkas</p>
                    </div>
                </div>

                <Card className="border border-slate-200 shadow-xl shadow-slate-200/40 rounded-sm bg-white overflow-hidden">
                    <CardHeader className="space-y-1 pt-8 px-8">
                        <CardTitle className="text-xl font-bold">Login NISN</CardTitle>
                        <CardDescription className="text-xs">
                            Gunakan 10 digit NISN Anda untuk mengakses sistem.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="nisn" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Nomor Induk Siswa Nasional <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nisn"
                                    placeholder="Masukkan 10 digit NISN"
                                    value={nisn}
                                    onChange={(e) => setNisn(e.target.value)}
                                    className="h-11 border-slate-200 focus-visible:ring-blue-600 rounded-sm bg-slate-50/50"
                                    maxLength={10}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm transition-all active:scale-[0.98] shadow-md shadow-blue-200/50"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mencermati...
                                    </>
                                ) : (
                                    'MASUK SEKARANG'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="bg-slate-50 px-8 py-5 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                            Butuh bantuan? Silahkan hubungi panitia pendaftaran di area sekolah atau melalui kontak resmi.
                        </p>
                    </CardFooter>
                </Card>

                <p className="text-center text-[10px] text-slate-400">
                    &copy; 2026 SMANSABA - Sistem Penerimaan Murid Baru
                </p>
            </div>
        </div>
    )
}
