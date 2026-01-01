import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
})

function DashboardIndexPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di SPMB SMANSABA
        </p>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 flex items-center justify-center">
          <span className="text-slate-400">Statistik 1</span>
        </div>
        <div className="aspect-video rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 flex items-center justify-center">
          <span className="text-slate-400">Statistik 2</span>
        </div>
        <div className="aspect-video rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 flex items-center justify-center">
          <span className="text-slate-400">Statistik 3</span>
        </div>
      </div>
      <div className="min-h-[50vh] flex-1 rounded-xl bg-slate-100/50 md:min-h-min dark:bg-slate-800/50 border border-slate-200 flex items-center justify-center">
        <span className="text-slate-400">Konten Dashboard</span>
      </div>
    </div>
  )
}
