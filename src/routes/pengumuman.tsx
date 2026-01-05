import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
    Search,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Sparkles,
    Loader2,
    Lock,
    RotateCcw,
    User,
    Hash,
    Calendar,
    Building,
    Trophy,
    Instagram,
    Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getActiveTahunAjaran } from '@/lib/server/tahun-ajaran'
import { checkAnnouncement } from '@/lib/server/students'

export const Route = createFileRoute('/pengumuman')({
    component: AnnouncementPage,
    loader: async () => {
        const activeTahun = await getActiveTahunAjaran()
        return {
            announcementDate: activeTahun?.tanggalPengumuman || new Date('2026-06-01T08:00:00'),
            tahunAjaran: activeTahun?.tahun || '2026/2027',
            tahap: activeTahun?.tahap || 'Tahap 2'
        }
    },
})

function AnnouncementPage() {
    const { announcementDate, tahap } = Route.useLoaderData()
    // Target date for announcement from database
    const targetDate = new Date(announcementDate).getTime()

    const [timeLeft, setTimeLeft] = useState<{
        days: number,
        hours: number,
        minutes: number,
        seconds: number,
        isExpired: boolean
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })

    const [isMounted, setIsMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [result, setResult] = useState<{
        found: boolean,
        status?: 'LULUS' | 'TIDAK_LULUS',
        name?: string,
        regNo?: string | null,
        nisn?: string | null,
        sekolahAsal?: string | null,
        tempatLahir?: string | null,
        tanggalLahir?: string | null,
        jalur?: string | null
    } | null>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted) return
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const distance = targetDate - now

            if (distance < 0) {
                clearInterval(timer)
                setTimeLeft(prev => ({ ...prev, isExpired: true }))
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                    isExpired: false
                })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate, isMounted])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery) return
        if (searchQuery.length !== 10) {
            alert('NISN harus 10 digit')
            return
        }

        setIsSearching(true)
        setResult(null)

        try {
            const data = await checkAnnouncement({ data: { nisn: searchQuery } })
            setResult(data)
        } catch (error: any) {
            console.error('Search failed:', error)
            setResult({ found: false })
        } finally {
            setIsSearching(false)
        }
    }

    // Helper function to format date efficiently
    const formatDate = (dateString?: string | null | Date) => {
        if (!dateString) return ''
        try {
            const date = new Date(dateString)
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ]
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
        } catch (e) {
            return String(dateString)
        }
    }

    const generateCoverMapPDF = async (data: any) => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        })

        const pageWidth = doc.internal.pageSize.width
        const margin = 20

        // Helper to get image as base64
        const getBase64ImageFromURL = (url: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = 'Anonymous'
                img.src = url
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        ctx.drawImage(img, 0, 0)
                        resolve(canvas.toDataURL('image/png'))
                    } else {
                        reject('Failed to get context')
                    }
                }
                img.onerror = (e) => reject(e)
            })
        }

        try {
            // Main Border
            doc.setDrawColor(0)
            doc.setLineWidth(0.5)
            // Draw a rectangle around the content area, ending below the No. Absen box
            doc.rect(5, 5, pageWidth - 10, 170, 'S')

            // Header logos - Side-by-side centered
            const logoJabar = await getBase64ImageFromURL('/logo-pemprov.png')
            const logoSpmb = await getBase64ImageFromURL('/logo-spmb.png')

            const totalLogoWidth = 47 // logo1(21) + gap(5) + logo2(21) approx 80px each
            const startX = (pageWidth - totalLogoWidth) / 2

            doc.addImage(logoJabar, 'PNG', startX, 10, 25, 21)
            doc.addImage(logoSpmb, 'PNG', startX + 26, 10, 40, 21)

            // Header Title
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(18)
            doc.text('SPMB SMAN 1 BANTARUJEG', pageWidth / 2, 45, { align: 'center' })
            doc.setFontSize(12)
            doc.text(`TAHAP 2 TAHUN AJAR 2025/2026`, pageWidth / 2, 51, { align: 'center' })

            // Jalur Section - Blue Button style
            doc.setFillColor(25, 118, 210) // Primary Blue
            const jalurText = `JALUR : ${String(data.jalur).toUpperCase()}`
            const textWidth = doc.getTextWidth(jalurText)
            const rectWidth = textWidth + 30
            doc.roundedRect((pageWidth - rectWidth) / 2, 58, rectWidth, 11, 4, 4, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(15)
            doc.text(jalurText, pageWidth / 2, 65.5, { align: 'center' })

            // Student Info & QR Code Container
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(11)

            const startY = 85
            const rowHeight = 6.5
            const labelCol = margin + 5
            const valCol = 65

            const info = [
                ['No. Pendaftar', `: ${data.regNo}`],
                ['NISN', `: ${data.nisn || '-'}`],
                ['Nama Lengkap', `: ${data.name.toUpperCase()}`],
                ['Jenis Kelamin', `: ${data.jenisKelamin || '-'}`],
                ['Asal Sekolah', `: ${data.sekolahAsal.toUpperCase()}`],
                ['Status', `: ${data.status}`]
            ]

            info.forEach((item, i) => {
                doc.setFont('helvetica', 'normal')
                doc.text(item[0], labelCol, startY + (i * rowHeight))

                // Handle text wrap for long sekolahAsal
                if (item[0] === 'Asal Sekolah' && item[1].length > 40) {
                    const splitText = doc.splitTextToSize(item[1], 80);
                    doc.setFont('helvetica', 'bold')
                    doc.text(splitText, valCol, startY + (i * rowHeight))
                } else {
                    doc.setFont('helvetica', 'bold')
                    doc.text(item[1], valCol, startY + (i * rowHeight))
                }
            })

            // QR Code generation
            const qrData = `${data.regNo}|${data.name}|${data.nisn}`
            const qrCodeBase64 = await QRCode.toDataURL(qrData, { margin: 1, width: 100 })
            doc.addImage(qrCodeBase64, 'PNG', pageWidth - 60, 85, 35, 35)

            // Divider Line
            doc.setDrawColor(240)
            doc.setLineWidth(0.2)
            doc.line(margin, 135, pageWidth - margin, 135)

            // Footer
            doc.setTextColor(0)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.text('Silahkan tunjukkan QR Code ini saat melakukan pendaftaran ulang', margin, 148)
            doc.setFontSize(9)
            doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID').replace(/\./g, ':').replace(',', '')}`, margin, 153)

            // No. Absen Box
            const boxWidth = 35
            const boxHeight = 22
            doc.setDrawColor(0)
            doc.setLineWidth(0.5)
            doc.roundedRect(pageWidth - margin - boxWidth, 142, boxWidth, boxHeight, 3, 3, 'S')
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.text('No. Absen', pageWidth - margin - boxWidth + 17.5, 146, { align: 'center' })

            // --- Requirements Section (New) ---
            const reqY = 185
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(14)
            doc.text('PERSYARATAN DAFTAR ULANG', pageWidth / 2, reqY, { align: 'center' })

            autoTable(doc, {
                startY: reqY + 5,
                head: [['Dokumen Persyaratan', 'Ceklis']],
                body: [
                    ['Surat Bukti Kelulusan SPMB 2025 Tahap 2', ''],
                    ['Foto Copy Kartu Keluarga', ''],
                    ['Ijazah SMP/MTs atau Surat Kelulusan atau Kartu Ujian', ''],
                    ['Tata Tertib SMA Negeri 1 Bantarujeg (Bermeterai)', ''],
                    ['Surat Pernyataan Tidak Mengkriminalisasi Sekolah', '']
                ],
                theme: 'grid',
                headStyles: {
                    fillColor: [232, 244, 253], // Light blue header
                    textColor: [0, 0, 0],
                    fontSize: 11,
                    halign: 'center',
                    fontStyle: 'bold',
                    lineWidth: 0.5,
                    lineColor: [0, 0, 0]
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [50, 50, 50],
                    cellPadding: 5,
                    lineWidth: 0.5,
                    lineColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { cellWidth: pageWidth - margin * 2 - 25 }, // Auto-calculate based on page width
                    1: { cellWidth: 25, halign: 'center' }
                },
                didDrawCell: (data) => {
                    // Draw checkbox in the Ceklis column (column 1)
                    if (data.section === 'body' && data.column.index === 1) {
                        const size = 6
                        const x = data.cell.x + (data.cell.width - size) / 2
                        const y = data.cell.y + (data.cell.height - size) / 2
                        doc.setDrawColor(0)
                        doc.setLineWidth(0.5)
                        doc.rect(x, y, size, size, 'S')
                    }
                },
                margin: { left: margin, right: margin }
            })

            // --- PAGE 2: Announcement Result (New) ---
            doc.addPage()

            // Border
            doc.setDrawColor(0)
            doc.setLineWidth(0.5)
            // Updated height to end just below the green bar (approx 185mm)
            doc.rect(5, 5, pageWidth - 10, 185, 'S')

            // Header Logos (Center) - Reusing logos from Page 1
            doc.addImage(logoJabar, 'PNG', startX, 15, 21, 21)
            doc.addImage(logoSpmb, 'PNG', startX + 26, 15, 40, 21)

            // Blue Bar
            doc.setFillColor(103, 185, 235) // Light Blue from image
            doc.rect(margin, 52, pageWidth - margin * 2, 8, 'F')

            // Title
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(16)
            doc.setTextColor(30, 30, 30)
            doc.text('Pengumuman Hasil Seleksi SPMB Jawa Barat 2025 Tahap 2', pageWidth / 2, 72, { align: 'center' })

            // Content Section
            const contentY = 85
            // Large QR Code
            doc.addImage(qrCodeBase64, 'PNG', margin, contentY, 40, 40)

            // Student Labels - Aligned with the top of QR code (contentY)
            // Offset 4 is roughly where the top of capital letters will start for 11pt font
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text('No. Pendaftar', margin + 50, contentY + 4)
            doc.text('Nama', margin + 50, contentY + 11)
            doc.text('Asal Sekolah', margin + 50, contentY + 18)

            doc.text(`: ${data.regNo}`, margin + 85, contentY + 4)
            doc.setFont('helvetica', 'bold')
            doc.text(`: ${data.name.toUpperCase()}`, margin + 85, contentY + 11)
            doc.setFont('helvetica', 'normal')
            doc.text(`: ${data.sekolahAsal.toUpperCase()}`, margin + 85, contentY + 18)

            // Acceptance Message - Tightened
            doc.setFontSize(12)
            doc.text('Selamat! Anda dinyatakan Diterima di:', margin + 50, contentY + 32)
            doc.setFontSize(15)
            doc.setFont('helvetica', 'bold')
            const resultText = `SMAN 1 BANTARUJEG - ${String(data.jalur).toUpperCase()}`
            doc.text(resultText, margin + 50, contentY + 41)

            // Attention Section - Tightened
            doc.setFontSize(11)
            doc.text('PERHATIAN!', margin, contentY + 56)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            const attentionText = `Pendaftar yang telah diterima wajib melakukan daftar ulang di sekolah tujuan pada tanggal 10 Juli 2025 - 11 Juli 2025.`
            const splitAttention = doc.splitTextToSize(attentionText, pageWidth - margin * 2)
            doc.text(splitAttention, margin, contentY + 62)

            // Green Bar - Tightened
            doc.setFillColor(0, 150, 60) // Green
            doc.rect(margin, contentY + 80, pageWidth - margin * 2, 10, 'F')

            // Save the PDF
            doc.save(`Pengumuman_${data.name.replace(/\s+/g, '_')}.pdf`)

        } catch (error) {
            console.error('PDF generation failed:', error)
            alert('Gagal membuat PDF. Pastikan aset logo tersedia.')
        }
    }

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col items-center relative select-none overflow-x-hidden">
            {/* Soft Light Mesh Background */}
            <div className="fixed top-0 inset-0 overflow-hidden -z-10 bg-[#f8fafc]">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] right-[-5%] w-[50%] h-[50%] bg-emerald-50/20 rounded-full blur-[100px]"></div>
            </div>

            <header className="w-full py-5 px-6 md:px-12 relative z-30 flex justify-start">
                <Link to="/">
                    <Button
                        variant="ghost"
                        className="bg-white/90 border border-slate-300 hover:bg-white text-slate-700 hover:text-emerald-800 backdrop-blur-md transition-all gap-2 text-[10px] md:text-[11px] font-black tracking-widest uppercase h-9 md:h-10 px-4 md:px-6 rounded-sm shadow-md"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Beranda</span>
                    </Button>
                </Link>
            </header>

            <div className="w-full max-w-2xl relative z-20 flex-1 flex flex-col justify-center my-12 px-6">
                {!timeLeft.isExpired ? (
                    /* Premium Light Countdown View */
                    <div key="countdown-view" className="space-y-8 md:space-y-12 animate-in fade-in zoom-in-95 duration-1000 ease-out">
                        <div className="text-center space-y-2 md:space-y-3">
                            <h1 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-emerald-800">Counting Down</h1>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                                Menuju <span className="text-emerald-700">Pengumuman</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: 'Hari', value: timeLeft.days },
                                { label: 'Jam', value: timeLeft.hours },
                                { label: 'Menit', value: timeLeft.minutes },
                                { label: 'Detik', value: timeLeft.seconds }
                            ].map((item, i) => (
                                <div key={i} className="group relative">
                                    <div className="absolute inset-0 bg-emerald-200/30 rounded-sm blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative flex flex-col items-center bg-white rounded-sm p-5 md:p-8 border border-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.06)] transition-all hover:scale-105 hover:shadow-[0_25px_60px_rgb(0,0,0,0.1)]">
                                        <span className="text-3xl md:text-6xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                        <span className="text-[10px] md:text-[11px] font-black text-emerald-800 uppercase tracking-[0.2em] mt-2 md:mt-4">
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-4 text-slate-600 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em]">
                            <div className="h-px w-8 md:w-16 bg-slate-400 opacity-30"></div>
                            <span className="flex items-center gap-2 whitespace-nowrap">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                SPMB SMANSABA 2026
                            </span>
                            <div className="h-px w-8 md:w-16 bg-slate-400 opacity-30"></div>
                        </div>
                    </div>
                ) : (
                    /* Search View */
                    <div key="search-view" className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-lg mx-auto w-full">
                        {!result || !result.found ? (
                            <>
                                <div className="text-center space-y-1">
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-900">Cek Hasil SPMB {tahap}</h2>
                                </div>
                                <Card className="bg-[#fafffb] border-emerald-100/50 shadow-sm rounded-sm overflow-hidden">
                                    <CardContent className="p-6 md:p-8 space-y-5">
                                        <form onSubmit={handleSearch} className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Masukkan NISN</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                                    <Input
                                                        placeholder="Masukkan 10 digit NISN"
                                                        className="h-12 pl-12 pr-12 text-base bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-400 focus:ring-0 rounded-sm transition-all shadow-sm"
                                                        value={searchQuery}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                            setSearchQuery(val)
                                                        }}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold tabular-nums">
                                                        {searchQuery.length}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSearching}
                                                className="w-full h-12 text-base font-bold bg-[#a0e9bc] hover:bg-[#86d9a5] text-emerald-900 rounded-sm shadow-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSearching ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Search className="w-4 h-4" />
                                                        Cek Hasil
                                                    </>
                                                )}
                                            </Button>
                                        </form>

                                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Petunjuk</p>
                                            <ul className="text-xs text-slate-500 font-medium space-y-1.5 list-disc pl-4 text-left">
                                                <li>Pastikan NISN sesuai dengan kartu peserta.</li>
                                                <li>Jika data tidak ditemukan, hubungi panitia SPMB.</li>
                                                <li>Pengumuman ini bersifat final dan mengikat.</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            /* Premium Result View - Single Page Fit */
                            <div className="animate-in zoom-in-95 fade-in duration-500 ease-out w-full max-w-2xl mx-auto flex flex-col justify-center">
                                <Card className={`bg-white border-t-0 my-auto shadow-2xl rounded-sm overflow-hidden relative transition-all duration-500 border ${result.status === 'LULUS' ? 'border-emerald-200' : 'border-red-200'}`}>
                                    {/* Refresh Icon Button */}
                                    <Button
                                        onClick={() => setResult(null)}
                                        variant="ghost"
                                        size="icon"
                                        className={`absolute top-3 right-3 transition-colors z-20 rounded-sm w-8 h-8 ${result.status === 'LULUS' ? 'text-emerald-400 hover:text-emerald-600' : 'text-red-300 hover:text-red-500'}`}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>

                                    {/* Merged Header & Content */}
                                    <div className="p-5 md:p-8 space-y-6">
                                        {/* Horizontal Header */}
                                        <div className={`p-6 rounded-sm flex items-center gap-5 transition-all ${result.status === 'LULUS' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                            <div className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full ${result.status === 'LULUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                <div className={`${result.status === 'LULUS' ? 'bg-emerald-600' : 'bg-red-600'} text-white rounded-full p-2 block shadow-lg animate-bounce`}>
                                                    {result.status === 'LULUS' ? (
                                                        <CheckCircle2 className="w-8 h-8" />
                                                    ) : (
                                                        <XCircle className="w-8 h-8" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col">
                                                    <h1 className={`text-xl font-black tracking-tight uppercase leading-tight ${result.status === 'LULUS' ? 'text-emerald-900' : 'text-red-900'}`}>
                                                        {result.status === 'LULUS' ? 'SELAMAT!' : 'MOHON MAAF,'}
                                                    </h1>
                                                    <p className={`text-lg font-bold uppercase leading-tight mb-1 ${result.status === 'LULUS' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {result.status === 'LULUS' ? 'ANDA DINYATAKAN LULUS' : 'ANDA BELUM LULUS'}
                                                    </p>
                                                    <p className="text-slate-500 font-medium text-xs truncate">Penerimaan Siswa Baru SMAN 1 Bantarujeg</p>
                                                </div>
                                            </div>
                                        </div>

                                        {result.status === 'LULUS' && (
                                            <Button
                                                onClick={() => generateCoverMapPDF(result)}
                                                variant="outline"
                                                className="w-full h-11 border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold gap-2 rounded-sm transition-all"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Cetak Cover Map
                                            </Button>
                                        )}

                                        {/* Data Grid */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                                Data Siswa
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                {/* Left Column */}
                                                <div className="space-y-2">
                                                    <div className={`flex gap-3 items-center group p-2 rounded-sm transition-all border ${result.status === 'LULUS' ? 'hover:bg-emerald-50 hover:border-emerald-100 border-transparent' : 'hover:bg-red-50 hover:border-red-100 border-transparent'}`}>
                                                        <div className={`p-2 rounded-sm ${result.status === 'LULUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Nama Lengkap</p>
                                                            <p className="text-xs font-bold text-slate-900 leading-tight uppercase truncate">{result.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex gap-3 items-center group p-2 rounded-sm transition-all border ${result.status === 'LULUS' ? 'hover:bg-emerald-50 hover:border-emerald-100 border-transparent' : 'hover:bg-red-50 hover:border-red-100 border-transparent'}`}>
                                                        <div className={`p-2 rounded-sm ${result.status === 'LULUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            <Hash className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">No. Peserta</p>
                                                            <p className="text-xs font-bold text-slate-900 tracking-tight truncate">{result.regNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex gap-3 items-center group p-2 rounded-sm transition-all border ${result.status === 'LULUS' ? 'hover:bg-emerald-50 hover:border-emerald-100 border-transparent' : 'hover:bg-red-50 hover:border-red-100 border-transparent'}`}>
                                                        <div className={`p-2 rounded-sm ${result.status === 'LULUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            <Calendar className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Tgl Lahir</p>
                                                            <p className="text-xs font-bold text-slate-900 uppercase truncate">
                                                                {result.tempatLahir}, {formatDate(result.tanggalLahir)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Right Column */}
                                                <div className="space-y-2">
                                                    <div className={`flex gap-3 items-center group p-2 rounded-sm transition-all border ${result.status === 'LULUS' ? 'hover:bg-emerald-50 hover:border-emerald-100 border-transparent' : 'hover:bg-red-50 hover:border-red-100 border-transparent'}`}>
                                                        <div className={`p-2 rounded-sm flex items-center justify-center w-8 h-8 ${result.status === 'LULUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            <span className="font-bold text-xs">#</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Asal Sekolah</p>
                                                            <p className="text-xs font-bold text-slate-900 leading-tight uppercase truncate">{result.sekolahAsal}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex gap-3 items-center group p-2 rounded-sm transition-all border ${result.status === 'LULUS' ? 'hover:bg-emerald-50 hover:border-emerald-100 border-transparent' : 'hover:bg-red-50 hover:border-red-100 border-transparent'}`}>
                                                        <div className={`p-2 rounded-sm ${result.status === 'LULUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            <Building className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">NISN</p>
                                                            <p className="text-xs font-bold text-slate-900 tracking-tight truncate">{result.nisn || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex gap-3 items-center group p-2 rounded-sm transition-all border ${result.status === 'LULUS' ? 'hover:bg-emerald-50 hover:border-emerald-100 border-transparent' : 'hover:bg-red-50 hover:border-red-100 border-transparent'}`}>
                                                        <div className={`p-2 rounded-sm ${result.status === 'LULUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            <Trophy className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Jalur</p>
                                                            <p className="text-xs font-bold text-slate-900 uppercase truncate">{result.jalur || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-center">
                                            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Catatan Penting</p>
                                            <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                                Simpan tangkapan layar halaman ini sebagai bukti kelulusan sementara.
                                                <br />
                                                Informasi daftar ulang akan diberitahukan kemudian.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {!result?.found && result !== null && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300 text-center p-4 bg-red-50 border border-red-100 rounded-sm">
                                <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Data Tidak Ditemukan!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <footer className="w-full py-5 mt-auto border-t border-slate-200/60 bg-white/30 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[13px] font-medium text-slate-500">
                    <p className="flex items-center gap-1">
                        © {new Date().getFullYear()} SPMB Online SMAN 1 BANTARUJEG,
                    </p>
                    <p className="flex items-center gap-1.5">
                        Made with <span className="animate-pulse">💖</span> for better web by
                        <a
                            href="https://www.instagram.com/deni_ikbal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-bold text-slate-700 hover:text-pink-600 transition-all group"
                        >
                            <Instagram className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            deni_ikbal
                        </a>
                    </p>
                </div>
            </footer>
        </div >
    )
}
