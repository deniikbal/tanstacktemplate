import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getPendaftarStats } from '@/lib/server/pendaftar'
import { Card, CardContent } from "@/components/ui/card"
import { Users, CheckCircle2, Clock, ArrowUpCircle } from "lucide-react"

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
})

function DashboardIndexPage() {
  const [stats, setStats] = useState<{ total: number, verified: number, unverified: number, tahap1: number, tahap2: number } | null>(null)

  useEffect(() => {
    getPendaftarStats().then(setStats)
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-slate-50/50">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Ringkasan data pendaftaran terkini SPMB SMANSABA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-400 transition-all bg-white">
          <CardContent className="p-0">
            <div className="flex items-stretch h-20">
              <div className="w-1.5 bg-indigo-500 group-hover:bg-indigo-600 transition-colors" />
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Pendaftar</p>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {stats?.total ?? 0}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-emerald-400 transition-all bg-white">
          <CardContent className="p-0">
            <div className="flex items-stretch h-20">
              <div className="w-1.5 bg-emerald-500 group-hover:bg-emerald-600 transition-colors" />
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Sudah Verifikasi</p>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {stats?.verified ?? 0}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-amber-400 transition-all bg-white">
          <CardContent className="p-0">
            <div className="flex items-stretch h-20">
              <div className="w-1.5 bg-amber-500 group-hover:bg-amber-600 transition-colors" />
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Belum Verifikasi</p>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {stats?.unverified ?? 0}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-purple-400 transition-all bg-white">
          <CardContent className="p-0">
            <div className="flex items-stretch h-20">
              <div className="w-1.5 bg-purple-500 group-hover:bg-purple-600 transition-colors" />
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <ArrowUpCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Tahap 1</p>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {stats?.tahap1 ?? 0}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 min-h-[400px] rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Grafik Pendaftaran</h3>
          <div className="h-[300px] w-full flex items-center justify-center border border-dashed rounded-lg bg-slate-50 italic text-slate-400">
            Integrasi Chart (Segera Hadir)
          </div>
        </div>
        <div className="col-span-3 min-h-[400px] rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Informasi Sistem</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-sm font-medium text-emerald-800">Status Server</p>
              <p className="text-xs text-emerald-600 mt-1">Berjalan normal melalui database Neon.tech</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-sm font-medium text-blue-800">Periode Pendaftaran</p>
              <p className="text-xs text-blue-600 mt-1">Januari 2026 - Juli 2026</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-sm font-medium text-slate-800">Versi Aplikasi</p>
              <p className="text-xs text-slate-500 mt-1">v1.2.0 (TanStack Start Build)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
