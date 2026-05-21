'use client'

import { useState } from 'react'
import { useSymbols } from '@/hooks/useSymbols'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Pencil, Check, X, Loader2, BarChart2 } from 'lucide-react'

export default function SettingsPage() {
  const { symbols, loading, addSymbol, deleteSymbol, updateSymbol } = useSymbols()

  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    setError(null)
    const { error } = await addSymbol(newName, newDesc)
    if (error) setError(error)
    else { setNewName(''); setNewDesc('') }
    setAdding(false)
  }

  function startEdit(id: string, name: string, desc: string | null) {
    setEditId(id)
    setEditName(name)
    setEditDesc(desc ?? '')
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim()) return
    setSaving(true)
    await updateSymbol(editId, editName, editDesc)
    setEditId(null)
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Symbol Management */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-zinc-100 text-sm font-semibold">Kelola Symbol</CardTitle>
          </div>
          <CardDescription className="text-zinc-500 text-xs">
            Tambah, edit, atau hapus symbol yang tampil di form input trade.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-zinc-800" />

        <CardContent className="pt-5 space-y-5">
          {/* Form tambah symbol baru */}
          <div className="space-y-3">
            <Label className="text-xs text-zinc-500 uppercase tracking-wide">Tambah Symbol Baru</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nama symbol (contoh: NQ)"
                value={newName}
                onChange={e => setNewName(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                maxLength={20}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm uppercase w-36"
              />
              <Input
                placeholder="Deskripsi (opsional)"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm flex-1"
              />
              <Button
                onClick={handleAdd}
                disabled={adding || !newName.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 px-3 shrink-0"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>

          <Separator className="bg-zinc-800" />

          {/* Daftar symbol */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500 uppercase tracking-wide">
              Daftar Symbol ({symbols.length})
            </Label>

            {loading ? (
              <div className="flex items-center gap-2 py-4 text-zinc-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Memuat...</span>
              </div>
            ) : symbols.length === 0 ? (
              <div className="py-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-lg">
                <BarChart2 className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Belum ada symbol. Tambah yang pertama!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {symbols.map(sym => (
                  <div
                    key={sym.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-800 group hover:border-zinc-700 transition-colors"
                  >
                    {editId === sym.id ? (
                      /* Mode edit */
                      <>
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value.toUpperCase())}
                          className="bg-zinc-700 border-zinc-600 text-zinc-100 h-7 text-sm uppercase w-28"
                          autoFocus
                        />
                        <Input
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          placeholder="Deskripsi..."
                          className="bg-zinc-700 border-zinc-600 text-zinc-100 h-7 text-sm flex-1 placeholder:text-zinc-500"
                        />
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon"
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="h-7 w-7 bg-emerald-600 hover:bg-emerald-500"
                          >
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditId(null)}
                            className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      /* Mode tampil */
                      <>
                        <Badge className="bg-zinc-700 text-zinc-200 border-zinc-600 font-mono text-xs shrink-0">
                          {sym.name}
                        </Badge>
                        <span className="text-xs text-zinc-500 flex-1 truncate">
                          {sym.description || <span className="text-zinc-700 italic">Tidak ada deskripsi</span>}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(sym.id, sym.name, sym.description)}
                            className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteSymbol(sym.id)}
                            className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
