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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
            </Link>

            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                        <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Portal Siswa</h1>
                    <p className="text-slate-500">Masuk untuk melihat pengumuman & upload berkas</p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                    <CardHeader className="space-y-1 bg-white pt-8 px-8">
                        <CardTitle className="text-2xl">Masuk</CardTitle>
                        <CardDescription>
                            Gunakan 10 digit NISN Anda untuk masuk ke sistem.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 bg-white">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nisn">NISN</Label>
                                <Input
                                    id="nisn"
                                    placeholder="Masukkan 10 digit NISN"
                                    value={nisn}
                                    onChange={(e) => setNisn(e.target.value)}
                                    className="h-12 border-slate-200 focus:ring-blue-600 rounded-xl"
                                    maxLength={10}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Masuk Ke Dashboard'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 px-8 py-6 border-t border-slate-100 italic text-center">
                        <p className="text-xs text-slate-500 w-full">
                            Butuh bantuan? Hubungi panitia SPMB SMANSABA di sekolah.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
