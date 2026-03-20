import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { getPendaftarList } from '@/lib/server/pendaftar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Bell,
    CheckCircle,
    Clock,
    Ticket,
    Maximize,
    Minimize
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getJakartaDate } from '@/lib/utils'

export const Route = createFileRoute('/monitor')({
    component: MonitorPage,
})

interface Pendaftar {
    id: string
    nmLengkap: string
    noAntrian: string | null
    statusAntrian: string | null
    tglAntrian: string | null
}

function MonitorPage() {
    const [pendaftar, setPendaftar] = useState<Pendaftar[]>([])
    const [isFullscreen, setIsFullscreen] = useState(false)
    const lastCalledId = useRef<string | null>(null)
    const today = getJakartaDate()

    const fetchData = async () => {
        try {
            const result = await getPendaftarList({
                data: {
                    limit: 200,
                    offset: 0,
                    tglAntrian: today
                }
            })
            const todayPendaftar = result.pendaftar as Pendaftar[]
            setPendaftar(todayPendaftar)

            // Auto Announcement Logic
            const currentlyCalling = todayPendaftar.find((p: Pendaftar) => p.statusAntrian === 'CALLING')
            if (currentlyCalling && currentlyCalling.id !== lastCalledId.current) {
                lastCalledId.current = currentlyCalling.id
                announce(currentlyCalling)
            }
        } catch (error) {
            console.error('Failed to fetch monitor data:', error)
        }
    }

    const announce = (p: Pendaftar) => {
        if (!p.noAntrian) return
        const text = `Nomor Antrian, ${p.noAntrian.split('').join(' ')}, atas nama, ${p.nmLengkap}, silakan menuju ruang tunggu.`
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'id-ID'
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 10000) // Poll every 10s

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            clearInterval(interval)
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }

    const calling = pendaftar.find((p: Pendaftar) => p.statusAntrian === 'CALLING')
    const inRoom = pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'IN_ROOM')
    const waiting = pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'WAITING').slice(0, 5)
    // const recentDone = pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'DONE').slice(0, 3)

    return (
        <div className="h-screen bg-slate-50 text-slate-900 p-4 font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col relative">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23475569' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
            />

            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-3 relative z-10">
                {/* Header & Stats Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-0.5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white border border-slate-400 shadow-sm rounded-md">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase leading-none">Monitor Antrian</h1>
                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">
                                SMAN 1 Bantarujeg <span className="mx-1.5 text-slate-300">|</span>
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-1 flex items-center gap-2">
                                <div className="p-1 bg-blue-500 rounded-md">
                                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-blue-400">Selesai</p>
                                    <p className="text-base font-black text-blue-700">{pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'DONE').length}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-md px-3 py-1 flex items-center gap-2">
                                <div className="p-1 bg-amber-500 rounded-md">
                                    <Clock className="w-2.5 h-2.5 text-white" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">Sisa</p>
                                    <p className="text-base font-black text-amber-700">{pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'WAITING').length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-0.5 hidden md:block" />

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleFullscreen}
                                className="bg-white border-slate-400 text-slate-600 hover:bg-slate-50 rounded-md gap-2 h-7 px-3 shadow-sm font-bold uppercase text-[9px]"
                            >
                                {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
                                {isFullscreen ? 'Keluar' : 'Layar Penuh'}
                            </Button>
                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-slate-400 shadow-sm h-7">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Live</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
                    {/* Primary Focus: NOW CALLING (Left Column) */}
                    <div className="flex-[1.8] flex flex-col min-h-0">
                        <Card className="flex-1 bg-white border border-slate-400 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] rounded-md overflow-hidden relative flex flex-col justify-center min-h-0">
                            {/* Decorative Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50" />
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-400/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

                            <CardContent className="p-4 md:p-6 text-center relative z-10 flex flex-col items-center justify-center space-y-4">
                                <div className="inline-flex items-center gap-2.5 bg-blue-600 px-6 py-2 rounded-full text-white shadow-lg shadow-blue-500/20 animate-bounce-slow shrink-0">
                                    <Bell className="w-5 h-5" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em]">Panggilan Antrian</span>
                                </div>

                                <div className="relative group leading-none">
                                    <div className="absolute -inset-4 bg-blue-100/30 rounded-md blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <h2 className="text-[10rem] md:text-[14rem] font-black tracking-tighter text-slate-900 leading-[1.0] relative flex items-center justify-center">
                                        {calling ? (
                                            <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-950 drop-shadow-sm">
                                                #{calling.noAntrian}
                                            </span>
                                        ) : (
                                            <Ticket className="w-32 h-32 md:w-48 md:h-48 text-blue-100 animate-pulse" />
                                        )}
                                    </h2>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tight leading-tight">
                                        {calling?.nmLengkap || 'Menunggu Antrian...'}
                                    </p>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="h-px w-10 bg-slate-200" />
                                        <p className="text-indigo-600 text-lg font-bold italic tracking-wide">
                                            Silakan menuju Meja Pendaftaran Utama
                                        </p>
                                        <div className="h-px w-10 bg-slate-200" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Secondary Sections (Right Column) */}
                    <div className="flex-1 flex flex-col gap-3 min-h-0">
                        {/* Antrian Berikutnya */}
                        <Card className="flex-1 bg-white border border-slate-400 shadow-xl rounded-md flex flex-col min-h-0 overflow-hidden">
                            <CardHeader className="p-1.5 px-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <div className="p-1 bg-amber-100 rounded-md">
                                            <Clock className="w-3 h-3" />
                                        </div>
                                        <h3 className="text-[12px] font-black uppercase tracking-wider">Antrian Berikutnya</h3>
                                    </div>
                                    <Badge variant="outline" className="border-amber-200 text-amber-600 font-extrabold text-[8px] px-1.5 py-0 rounded-md">NEXT</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-hidden flex-1 overflow-y-auto">
                                <div className="divide-y divide-slate-100">
                                    {waiting.length > 0 ? waiting.slice(0, 5).map((p: Pendaftar, i: number) => (
                                        <div key={p.id} className="py-1.5 px-3 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-lg font-black text-slate-200 group-hover:text-amber-500/30 transition-colors w-5">{i + 1}</span>
                                                <div>
                                                    <p className="text-[12px] font-black text-slate-800 group-hover:text-amber-600 transition-colors leading-tight uppercase">{p.nmLengkap}</p>
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Calon Peserta Didik</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-100 group-hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors flex-shrink-0">
                                                <span className="text-sm font-black text-slate-600 group-hover:text-amber-600">#{p.noAntrian}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center p-3 text-slate-400 space-y-0.5">
                                            <Ticket className="w-5 h-5 opacity-20" />
                                            <p className="italic text-[9px] font-bold uppercase tracking-widest">Belum ada antrian</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sedang Dilayani */}
                        <Card className="flex-1 bg-white border border-slate-400 shadow-xl rounded-md flex flex-col min-h-0 overflow-hidden">
                            <CardHeader className="p-1.5 px-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <div className="p-1 bg-blue-100 rounded-md">
                                            <Ticket className="w-3 h-3" />
                                        </div>
                                        <h3 className="text-[12px] font-black uppercase tracking-wider">Sedang Dilayani</h3>
                                    </div>
                                    <Badge variant="outline" className="border-blue-200 text-blue-600 font-extrabold text-[8px] px-1.5 py-0 rounded-md">BUSY</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-hidden flex-1 overflow-y-auto">
                                <div className="divide-y divide-slate-100">
                                    {inRoom.length > 0 ? inRoom.slice(0, 5).map((p: Pendaftar) => (
                                        <div key={p.id} className="py-1.5 px-3 flex items-center justify-between bg-blue-50/30 group">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                                <div>
                                                    <p className="text-[12px] font-black text-slate-800 leading-tight uppercase">{p.nmLengkap}</p>
                                                    <p className="text-[8px] text-blue-500 font-black uppercase tracking-widest">Status: Di Ruangan</p>
                                                </div>
                                            </div>
                                            <div className="bg-blue-600 px-2 py-0.5 rounded-md shadow-md shadow-blue-500/10 flex-shrink-0">
                                                <span className="text-sm font-black text-white">#{p.noAntrian}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center p-3 text-slate-400 space-y-0.5">
                                            <Users className="w-5 h-5 opacity-20" />
                                            <p className="italic text-[9px] font-bold uppercase tracking-widest">Tidak ada pelayanan</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Custom Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-8px); filter: drop-shadow(0 20px 20px rgba(59, 130, 246, 0.2)); }
                    50% { transform: translateY(8px); filter: drop-shadow(0 5px 5px rgba(59, 130, 246, 0.1)); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
                body::-webkit-scrollbar {
                    display: none;
                }
                body {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            ` }} />
        </div>
    )
}
