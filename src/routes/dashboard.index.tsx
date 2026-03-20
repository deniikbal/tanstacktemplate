import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getPendaftarStats, getRegistrationChartData } from '@/lib/server/pendaftar'
import { getJalurStats } from '@/lib/server/kelulusan'
import { getActiveTahunAjaran } from '@/lib/server/tahun-ajaran'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CheckCircle2, Clock, ArrowUpCircle, GraduationCap, School, TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
})

function DashboardIndexPage() {
  const [stats, setStats] = useState<{ total: number, verified: number, unverified: number, tahap1: number, tahap2: number } | null>(null)
  const [jalurStats, setJalurStats] = useState<{ jalur: string | null, count: number }[]>([])
  const [chartData, setChartData] = useState<{
    trendData: { date: string, count: number }[],
    jalurData: { name: string, value: number }[],
    statusData: { name: string, value: number }[]
  } | null>(null)
  const [activeTA, setActiveTA] = useState<string | null>(null)

  useEffect(() => {
    getActiveTahunAjaran().then((res) => {
      if (res) setActiveTA(res.tahun)
    })
  }, [])

  useEffect(() => {
    const ta = activeTA || "2026/2027"
    getPendaftarStats({ data: { tahunAjaran: ta } }).then(setStats)
    getJalurStats({ data: { tahunAjaran: ta } }).then(setJalurStats as any)
    getRegistrationChartData({ data: { tahunAjaran: ta } }).then(setChartData as any)
  }, [activeTA])

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">
            Ringkasan data pendaftaran terkini SPMB SMAN 1 BANTARUJEG.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-slate-300 shadow-sm">
          <School className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            TA {activeTA || '2026/2027'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... (existing cards) ... */}
        <Card className="border-slate-300 shadow-sm rounded-md overflow-hidden group hover:border-indigo-400 transition-all bg-white">
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

        <Card className="border-slate-300 shadow-sm rounded-md overflow-hidden group hover:border-blue-400 transition-all bg-white">
          <CardContent className="p-0">
            <div className="flex items-stretch h-20">
              <div className="w-1.5 bg-blue-500 group-hover:bg-blue-600 transition-colors" />
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
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

        <Card className="border-slate-300 shadow-sm rounded-md overflow-hidden group hover:border-amber-400 transition-all bg-white">
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

        <Card className="border-slate-300 shadow-sm rounded-md overflow-hidden group hover:border-purple-400 transition-all bg-white">
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

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-slate-300 shadow-sm bg-white rounded-md overflow-hidden">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Statistik Siswa Diterima</CardTitle>
                <CardDescription className="text-xs">Rincian siswa dengan status Lulus berdasarkan jalur pendaftaran.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {jalurStats.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 italic text-sm">
                  Belum ada data siswa yang diterima.
                </div>
              ) : (
                jalurStats.map((item, idx) => (
                  <div key={idx} className="flex flex-col p-4 rounded-md bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
                      {item.jalur || 'TIDAK ADA JALUR'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                        {item.count}
                      </span>
                      <span className="text-xs font-medium text-slate-500">Siswa</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 min-h-[400px] flex flex-col gap-6">
          <Card className="border-slate-300 shadow-sm bg-white rounded-md overflow-hidden flex-1">
            <CardHeader className="pb-2 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800">Trend Pendaftaran</CardTitle>
                    <CardDescription className="text-[10px]">Pendaftar harian (30 hari terakhir)</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px] w-full">
                {chartData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.trendData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(str) => {
                          const date = new Date(str);
                          return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                        }}
                      />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '4px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        name="Jumlah Pendaftar"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center animate-pulse bg-slate-50 rounded-lg" />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-purple-600" />
                  <CardTitle className="text-xs font-bold text-slate-800">Distribusi Jalur</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-[180px]">
                  {chartData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.jalurData}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.jalurData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-xs font-bold text-slate-800">Status Verifikasi</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-[180px]">
                  {chartData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.statusData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {chartData.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Terverifikasi' ? '#10b981' : '#f59e0b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="col-span-3 min-h-[400px] rounded-md bg-white border border-slate-300 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Informasi Sistem</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Status Server</p>
              <p className="text-xs text-blue-600 mt-1">Berjalan normal melalui database Neon.tech</p>
            </div>
            <div className="p-4 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Periode Pendaftaran</p>
              <p className="text-xs text-blue-600 mt-1">Januari 2026 - Juli 2026</p>
            </div>
            <div className="p-4 rounded-md bg-slate-50 border border-slate-300">
              <p className="text-sm font-medium text-slate-800">Versi Aplikasi</p>
              <p className="text-xs text-slate-500 mt-1">v1.2.0 (TanStack Start Build)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
