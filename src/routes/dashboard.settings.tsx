import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Settings, Save, Loader2, GraduationCap, Plus, Trash2, Check, Pencil } from 'lucide-react'
import {
  getAllTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  setActiveTahunAjaran,
  deleteTahunAjaran
} from '@/lib/server/tahun-ajaran'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

type TahunAjaranData = {
  id: string
  tahun: string
  tahap: string | null
  tanggalPengumuman: Date | null
  isAktif: boolean
  createdAt: Date
  updatedAt: Date
}

function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaranData[]>([])

  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTahun, setNewTahun] = useState('')
  const [newTahap, setNewTahap] = useState('')
  const [newTanggal, setNewTanggal] = useState('')
  const [newJam, setNewJam] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Edit dialog state
  const [editItem, setEditItem] = useState<TahunAjaranData | null>(null)
  const [editTahap, setEditTahap] = useState('')
  const [editTanggal, setEditTanggal] = useState('')
  const [editJam, setEditJam] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Delete dialog state
  const [deleteItem, setDeleteItem] = useState<TahunAjaranData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const data = await getAllTahunAjaran()
      setTahunAjaranList(data)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newTahun) {
      toast.error('Harap isi tahun ajaran')
      return
    }

    if (!/^\d{4}\/\d{4}$/.test(newTahun)) {
      toast.error('Format tahun ajaran tidak valid. Gunakan format: 2026/2027')
      return
    }

    try {
      setIsAdding(true)
      const tanggalPengumuman = newTanggal && newJam
        ? new Date(`${newTanggal}T${newJam}:00`).toISOString()
        : undefined

      await createTahunAjaran({ data: { tahun: newTahun, tahap: newTahap, tanggalPengumuman } })
      toast.success('Tahun ajaran berhasil ditambahkan')
      setIsAddDialogOpen(false)
      setNewTahun('')
      setNewTahap('')
      setNewTanggal('')
      setNewJam('')
      loadData()
    } catch (error) {
      console.error('Error adding:', error)
      toast.error('Gagal menambahkan tahun ajaran')
    } finally {
      setIsAdding(false)
    }
  }

  const handleEdit = async () => {
    if (!editItem) return

    try {
      setIsEditing(true)
      const tanggalPengumuman = editTanggal && editJam
        ? new Date(`${editTanggal}T${editJam}:00`).toISOString()
        : null

      await updateTahunAjaran({ data: { id: editItem.id, tahap: editTahap, tanggalPengumuman } })
      toast.success('Pengaturan berhasil diperbarui')
      setEditItem(null)
      loadData()
    } catch (error) {
      console.error('Error updating:', error)
      toast.error('Gagal memperbarui tanggal pengumuman')
    } finally {
      setIsEditing(false)
    }
  }

  const handleSetActive = async (item: TahunAjaranData) => {
    try {
      await setActiveTahunAjaran({ data: { id: item.id } })
      toast.success(`Tahun ajaran ${item.tahun} berhasil diaktifkan`)
      loadData()
    } catch (error) {
      console.error('Error setting active:', error)
      toast.error('Gagal mengaktifkan tahun ajaran')
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return

    try {
      setIsDeleting(true)
      await deleteTahunAjaran({ data: { id: deleteItem.id } })
      toast.success('Tahun ajaran berhasil dihapus')
      setDeleteItem(null)
      loadData()
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Gagal menghapus tahun ajaran')
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (item: TahunAjaranData) => {
    setEditItem(item)
    setEditTahap(item.tahap || '')
    if (item.tanggalPengumuman) {
      const date = new Date(item.tanggalPengumuman)
      setEditTanggal(date.toISOString().split('T')[0])
      setEditJam(date.toTimeString().slice(0, 5))
    } else {
      setEditTanggal('')
      setEditJam('')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Settings className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
          <p className="text-sm text-slate-500">Kelola pengaturan sistem PPDB</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              Tahun Ajaran
            </CardTitle>
            <CardDescription>
              Kelola daftar tahun ajaran PPDB. Tahun yang aktif akan digunakan untuk pendaftaran baru.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tahun Ajaran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Tahun Ajaran Baru</DialogTitle>
                <DialogDescription>
                  Masukkan tahun ajaran baru dan tanggal pengumuman (opsional).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newTahun">Tahun Ajaran</Label>
                  <Input
                    id="newTahun"
                    placeholder="2026/2027"
                    value={newTahun}
                    onChange={(e) => setNewTahun(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Format: YYYY/YYYY</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newTahap">Tahap SPMB</Label>
                  <Input
                    id="newTahap"
                    placeholder="Contoh: Tahap 2"
                    value={newTahap}
                    onChange={(e) => setNewTahap(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Teks ini akan muncul di halaman pengumuman</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newTanggal">Tanggal Pengumuman</Label>
                    <Input
                      id="newTanggal"
                      type="date"
                      value={newTanggal}
                      onChange={(e) => setNewTanggal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newJam">Jam</Label>
                    <Input
                      id="newJam"
                      type="time"
                      value={newJam}
                      onChange={(e) => setNewJam(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAdd} disabled={isAdding} className="bg-emerald-600 hover:bg-emerald-700">
                  {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Tambah
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahun Ajaran</TableHead>
                <TableHead>Tahap</TableHead>
                <TableHead>Tanggal Pengumuman</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tahunAjaranList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                    Belum ada data tahun ajaran. Klik "Tambah Tahun Ajaran" untuk memulai.
                  </TableCell>
                </TableRow>
              ) : (
                tahunAjaranList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.tahun}</TableCell>
                    <TableCell className="font-medium">{item.tahap || '-'}</TableCell>
                    <TableCell>
                      {item.tanggalPengumuman ? (
                        new Date(item.tanggalPengumuman).toLocaleString('id-ID', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })
                      ) : (
                        <span className="text-slate-400 italic">Belum diatur</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isAktif ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Tidak Aktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          title="Edit tanggal pengumuman"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {!item.isAktif && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetActive(item)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Set sebagai aktif"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {!item.isAktif && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteItem(item)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengaturan Tahun Ajaran</DialogTitle>
            <DialogDescription>
              Atur tahap dan tanggal pengumuman untuk tahun ajaran {editItem?.tahun}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTahap">Tahap SPMB</Label>
              <Input
                id="editTahap"
                placeholder="Contoh: Tahap 2"
                value={editTahap}
                onChange={(e) => setEditTahap(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTanggal">Tanggal</Label>
                <Input
                  id="editTanggal"
                  type="date"
                  value={editTanggal}
                  onChange={(e) => setEditTanggal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editJam">Jam</Label>
                <Input
                  id="editJam"
                  type="time"
                  value={editJam}
                  onChange={(e) => setEditJam(e.target.value)}
                />
              </div>
            </div>
          </div>
          {editTanggal && editJam && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Preview:</strong>{' '}
                {new Date(`${editTanggal}T${editJam}:00`).toLocaleString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Batal
            </Button>
            <Button onClick={handleEdit} disabled={isEditing} className="bg-emerald-600 hover:bg-emerald-700">
              {isEditing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tahun Ajaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tahun ajaran <strong>{deleteItem?.tahun}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
