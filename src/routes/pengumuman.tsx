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
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

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

            // Generate QR code if result found
            if (data.found && data.regNo && data.name && data.nisn) {
                const qrData = `${data.regNo}|${data.name}|${data.nisn}`
                const qrUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 150 })
                setQrCodeUrl(qrUrl)
            }
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
        <div className="min-h-screen w-full bg-white text-slate-900 font-sans flex flex-col">
            {/* Header */}
            <header className="w-full py-4 px-4 md:px-8 border-b border-slate-100 bg-white">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/">
                        <Button
                            variant="ghost"
                            className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 gap-2 text-sm font-medium h-10 px-4 rounded-lg"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Beranda
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="text-white w-4 h-4" />
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:block">SPMB <span className="text-emerald-600">SMANSABA</span></span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
                <div className="w-full max-w-xl">
                    {!timeLeft.isExpired ? (
                        /* Countdown View */
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Title */}
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold">
                                    <Lock className="w-3 h-3" />
                                    Menunggu Waktu Pengumuman
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                    Pengumuman Hasil SPMB
                                </h1>
                                <p className="text-slate-500 text-sm">
                                    {tahap} - Tahun Ajaran 2026/2027
                                </p>
                            </div>

                            {/* Countdown Timer */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 md:p-8">
                                <div className="grid grid-cols-4 gap-3 md:gap-4">
                                    {[
                                        { label: 'Hari', value: timeLeft.days },
                                        { label: 'Jam', value: timeLeft.hours },
                                        { label: 'Menit', value: timeLeft.minutes },
                                        { label: 'Detik', value: timeLeft.seconds }
                                    ].map((item, i) => (
                                        <div key={i} className="text-center">
                                            <div className="bg-white border border-slate-200 rounded-lg p-3 md:p-4 shadow-sm">
                                                <span className="text-2xl md:text-4xl font-bold text-slate-900 tabular-nums">
                                                    {String(item.value).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500 mt-2 block">
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-amber-800 text-sm text-center">
                                    <span className="font-semibold">Info:</span> Hasil seleksi akan dapat diakses setelah waktu pengumuman tiba.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Search View */
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {!result || !result.found ? (
                                <>
                                    {/* Title */}
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Pengumuman Telah Dibuka
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                            Cek Hasil SPMB {tahap}
                                        </h1>
                                        <p className="text-slate-500 text-sm">
                                            Masukkan NISN untuk melihat hasil seleksi
                                        </p>
                                    </div>

                                    {/* Search Card */}
                                    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                                        <CardContent className="p-6 space-y-5">
                                            <form onSubmit={handleSearch} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">NISN (Nomor Induk Siswa Nasional)</label>
                                                    <div className="relative">
                                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <Input
                                                            placeholder="Contoh: 0012345678"
                                                            className="h-12 pl-10 pr-16 text-base border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                                                            value={searchQuery}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                                setSearchQuery(val)
                                                            }}
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium tabular-nums">
                                                            {searchQuery.length}/10
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={isSearching || searchQuery.length !== 10}
                                                    className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                                                >
                                                    {isSearching ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Search className="w-4 h-4 mr-2" />
                                                            Cek Hasil
                                                        </>
                                                    )}
                                                </Button>
                                            </form>

                                            {/* Not Found Message */}
                                            {!result?.found && result !== null && (
                                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                                                    <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                                                    <p className="text-red-700 text-sm font-medium">Data tidak ditemukan</p>
                                                    <p className="text-red-600 text-xs mt-1">Pastikan NISN yang dimasukkan benar</p>
                                                </div>
                                            )}

                                            {/* Instructions */}
                                            <div className="pt-4 border-t border-slate-100">
                                                <p className="text-xs font-medium text-slate-500 mb-2">Petunjuk:</p>
                                                <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                                                    <li>NISN terdiri dari 10 digit angka</li>
                                                    <li>Pastikan NISN sesuai dengan kartu peserta</li>
                                                    <li>Jika data tidak ditemukan, hubungi panitia SPMB</li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                /* Result View */
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    <Card className={`border-2 shadow-lg rounded-xl overflow-hidden ${result.status === 'LULUS' ? 'border-emerald-200' : 'border-red-200'}`}>
                                        {/* Result Header */}
                                        <div className={`p-6 ${result.status === 'LULUS' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                                                {/* QR Code */}
                                                {qrCodeUrl && (
                                                    <div className="flex-shrink-0">
                                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                                                            <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 sm:w-28 sm:h-28" />
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 text-center mt-1">Scan untuk verifikasi</p>
                                                    </div>
                                                )}
                                                {/* Status Info */}
                                                <div className="text-center sm:text-left">
                                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${result.status === 'LULUS' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                        {result.status === 'LULUS' ? (
                                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                                        ) : (
                                                            <XCircle className="w-6 h-6 text-red-600" />
                                                        )}
                                                    </div>
                                                    <h2 className={`text-xl font-bold ${result.status === 'LULUS' ? 'text-emerald-900' : 'text-red-900'}`}>
                                                        {result.status === 'LULUS' ? 'SELAMAT! ANDA LULUS' : 'MOHON MAAF'}
                                                    </h2>
                                                    <p className={`text-sm ${result.status === 'LULUS' ? 'text-emerald-700' : 'text-red-700'}`}>
                                                        {result.status === 'LULUS' ? 'SPMB SMAN 1 Bantarujeg' : 'Anda belum diterima'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Student Data */}
                                        <CardContent className="p-6 space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                Data Siswa
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="p-3 bg-slate-50 rounded-lg">
                                                    <p className="text-xs text-slate-500 mb-1">Nama Lengkap</p>
                                                    <p className="text-sm font-semibold text-slate-900 uppercase">{result.name}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-lg">
                                                    <p className="text-xs text-slate-500 mb-1">No. Peserta</p>
                                                    <p className="text-sm font-semibold text-slate-900">{result.regNo}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-lg">
                                                    <p className="text-xs text-slate-500 mb-1">NISN</p>
                                                    <p className="text-sm font-semibold text-slate-900">{result.nisn || '-'}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-lg">
                                                    <p className="text-xs text-slate-500 mb-1">Asal Sekolah</p>
                                                    <p className="text-sm font-semibold text-slate-900 uppercase">{result.sekolahAsal}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-lg">
                                                    <p className="text-xs text-slate-500 mb-1">Tempat, Tanggal Lahir</p>
                                                    <p className="text-sm font-semibold text-slate-900">{result.tempatLahir}, {formatDate(result.tanggalLahir)}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-lg">
                                                    <p className="text-xs text-slate-500 mb-1">Jalur Pendaftaran</p>
                                                    <p className="text-sm font-semibold text-slate-900 uppercase">{result.jalur || '-'}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                                {result.status === 'LULUS' && (
                                                    <Button
                                                        onClick={() => generateCoverMapPDF(result)}
                                                        className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                                                    >
                                                        <Printer className="w-4 h-4 mr-2" />
                                                        Cetak Cover Map
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => setResult(null)}
                                                    variant="outline"
                                                    className="flex-1 h-11 border-slate-200 hover:bg-slate-50 font-semibold rounded-lg"
                                                >
                                                    <RotateCcw className="w-4 h-4 mr-2" />
                                                    Cek Ulang
                                                </Button>
                                            </div>

                                            {/* Note */}
                                            {result.status === 'LULUS' && (
                                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-amber-800 text-xs">
                                                        <span className="font-semibold">Catatan:</span> Simpan tangkapan layar ini sebagai bukti. Informasi daftar ulang akan disampaikan kemudian.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-4 border-t border-slate-100 bg-slate-50">
                <div className="flex flex-col items-center gap-1 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} SPMB Online SMAN 1 Bantarujeg</p>
                    <p className="flex items-center gap-1">
                        Made with <span className="text-red-500">♥</span> by
                        <a
                            href="https://www.instagram.com/deni_ikbal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-700 hover:text-emerald-600 inline-flex items-center gap-1"
                        >
                            <Instagram className="w-3 h-3" />
                            deni_ikbal
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    )
}
