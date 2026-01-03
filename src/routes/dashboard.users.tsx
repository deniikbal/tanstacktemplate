import { createFileRoute } from '@tanstack/react-router'
import { authClient } from "@/lib/auth-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  MoreHorizontal,
  Search,
  Key,
  UserCog,
  Trash2,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export const Route = createFileRoute('/dashboard/users')({
  component: UsersPage,
})

function UsersPage() {
  const [usersInfo, setUsersInfo] = useState<{ users: any[], total: number } | null>(null)
  const [isPending, setIsPending] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Pagination State
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState('10')

  const fetchUsers = async () => {
    setIsPending(true)
    const { data, error } = await authClient.admin.listUsers({
      query: {
        limit: Number(pageSize),
        offset: (page - 1) * Number(pageSize),
        searchField: searchTerm ? 'name' : undefined,
        searchOperator: searchTerm ? 'contains' : undefined,
        searchValue: searchTerm || undefined,
        // Better Auth admin.listUsers supports filtering? 
        // Let's assume it doesn't support direct role filter in query if not mentioned, 
        // but looking at standard admin APIs, if it's not supported we might filter client-side or check better-auth docs.
        // For now, I'll include it if possible or handle it.
      }
    })

    if (error) {
      toast.error(error.message || 'Gagal mengambil data user')
    } else {
      // If role filter is active and not 'all', we might need to filter manually if API doesn't support it
      // Standard Better Auth listUsers might not support role filter in query.
      let users = data?.users || []
      if (roleFilter !== 'all') {
        users = users.filter((u: any) => u.role === roleFilter)
      }
      setUsersInfo({ users, total: data?.total || 0 } as any)
    }
    setIsPending(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Re-fetch when page, search, role, or pageSize changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [page, searchTerm, roleFilter, pageSize])

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }

  const executeDeleteUser = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    const { error } = await authClient.admin.removeUser({ userId: userToDelete })
    if (error) {
      toast.error(error.message || 'Gagal menghapus user')
    } else {
      toast.success('User berhasil dihapus')
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      fetchUsers()
    }
    setIsDeleting(false)
  }

  const totalPages = Math.ceil((usersInfo?.total || 0) / Number(pageSize))

  return (
    <div className="p-6 space-y-6">
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user ini?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                executeDeleteUser()
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Page Header with Icon */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Users className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen User</h1>
          <p className="text-sm text-slate-500">Kelola pengguna aplikasi SPMB SMAN 1 BANTARUJEG</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-emerald-600" />
              Daftar Pengguna
            </CardTitle>
            <CardDescription>
              Kelola akun pengguna, ubah role, atau reset password.
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah User
              </Button>
            </DialogTrigger>
            <CreateUserDialog onEmailCreated={() => {
              setIsCreateOpen(false)
              fetchUsers()
            }} />
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Show</span>
              <Select value={pageSize} onValueChange={(val) => {
                setPageSize(val)
                setPage(1)
              }}>
                <SelectTrigger className="w-[70px] bg-white h-9 border-slate-200 shadow-sm focus:ring-emerald-500">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 md:justify-end max-w-2xl">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari user..."
                  className="pl-9 bg-white h-9 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              <Select value={roleFilter} onValueChange={(val) => {
                setRoleFilter(val)
                setPage(1)
              }}>
                <SelectTrigger className="w-[120px] bg-white h-9 border-slate-200 shadow-sm focus:ring-emerald-500">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Pilih</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="font-semibold text-slate-700 px-6 py-2 h-10">Nama</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-6 py-2 h-10">Email</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-6 py-2 h-10">Role</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-6 py-2 h-10">Dibuat Pada</TableHead>
                  <TableHead className="w-[70px] px-6 py-2 h-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-6 py-2">
                        <Skeleton className="h-5 w-[150px] bg-slate-200" />
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        <Skeleton className="h-5 w-[200px] bg-slate-200" />
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        <Skeleton className="h-5 w-[60px] rounded-full bg-slate-200" />
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        <Skeleton className="h-4 w-[80px] bg-slate-200" />
                      </TableCell>
                      <TableCell className="px-6 py-2 text-right">
                        <Skeleton className="ml-auto h-7 w-7 rounded-sm bg-slate-200" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !usersInfo || usersInfo.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500 italic">
                      Tidak ada user ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  usersInfo.users.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors group">
                      <TableCell className="font-medium text-slate-900 px-6 py-2">{user.name || 'Tidak ada nama'}</TableCell>
                      <TableCell className="text-slate-600 px-6 py-2">{user.email}</TableCell>
                      <TableCell className="px-6 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0 text-[11px] font-semibold shadow-sm ${(user.role || 'user') === 'admin'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}>
                          {user.role || 'user'}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 px-6 py-2 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-200">
                            <DropdownMenuLabel>Aksi Kontrol</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user)
                              setIsEditOpen(true)
                            }}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Edit Profil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user)
                              setIsPasswordOpen(true)
                            }}>
                              <Key className="mr-2 h-4 w-4" />
                              Ganti Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {usersInfo && usersInfo.total > 0 && (
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500">
                Menampilkan <span className="font-medium text-slate-900">{Math.min(usersInfo.total, (page - 1) * Number(pageSize) + 1)}</span>
                {' '}- <span className="font-medium text-slate-900">{Math.min(usersInfo.total, page * Number(pageSize))}</span>
                {' '}dari <span className="font-medium text-slate-900">{usersInfo.total}</span> data
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value)
                    setPage(1)
                  }}
                  className="text-xs border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => page > 1 && setPage(p => p - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>

                {(() => {
                  const pages = []
                  const showEllipsisStart = page > 3
                  const showEllipsisEnd = page < totalPages - 2

                  pages.push(1)
                  if (showEllipsisStart) pages.push('...')
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                    if (!pages.includes(i)) pages.push(i)
                  }
                  if (showEllipsisEnd) pages.push('...')
                  if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages)

                  return pages.map((p, idx) => (
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-slate-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`min-w-[32px] h-8 px-3 py-1.5 text-sm rounded-md transition-colors ${page === p
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        {p}
                      </button>
                    )
                  ))
                })()}

                <button
                  onClick={() => page < totalPages && setPage(p => p + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Ubah informasi profil pengguna.
            </DialogDescription>
          </DialogHeader>
          <EditUserForm
            user={selectedUser}
            onSuccess={() => {
              setIsEditOpen(false)
              fetchUsers()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Setel ulang password untuk <strong>{selectedUser?.name || selectedUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <ChangePasswordForm
            userId={selectedUser?.id}
            onSuccess={() => setIsPasswordOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateUserDialog({ onEmailCreated }: { onEmailCreated: () => void }) {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("user")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const { error } = await authClient.admin.createUser({
      email,
      password,
      name,
      role: role as "user" | "admin",
    })

    if (error) {
      toast.error(error.message || 'Gagal membuat user')
    } else {
      toast.success('User berhasil dibuat')
      onEmailCreated()
    }
    setLoading(false)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tambah User Baru</DialogTitle>
        <DialogDescription>
          Buat akun pengguna baru secara manual.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input id="name" name="name" placeholder="Contoh: Revi Indika" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="user@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm focus:ring-emerald-500">
              <SelectValue placeholder="Pilih Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan User'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function EditUserForm({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState(user?.role || "user")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string

    const { error } = await authClient.admin.updateUser({
      userId: user.id,
      data: {
        name,
        role: role as "user" | "admin"
      }
    })

    if (error) {
      toast.error(error.message || 'Gagal memperbarui user')
    } else {
      toast.success('User berhasil diperbarui')
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Nama Lengkap</Label>
        <Input id="edit-name" name="name" defaultValue={user?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-email">Email (Tidak dapat diubah)</Label>
        <Input id="edit-email" value={user?.email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-role">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="edit-role" className="w-full bg-white border-slate-200 shadow-sm focus:ring-emerald-500">
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function ChangePasswordForm({ userId, onSuccess }: { userId: string, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok')
      setLoading(false)
      return
    }

    const { error: pwdError } = await authClient.admin.setUserPassword({
      userId: userId,
      newPassword: password
    })

    if (pwdError) {
      toast.error(pwdError.message || 'Gagal mengganti password')
    } else {
      toast.success('Password berhasil diganti')
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password">Password Baru</Label>
        <Input id="new-password" name="password" type="password" required minLength={6} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
        <Input id="confirm-password" name="confirm-password" type="password" required minLength={6} />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? 'Mengganti...' : 'Ganti Password'}
        </Button>
      </DialogFooter>
    </form>
  )
}
