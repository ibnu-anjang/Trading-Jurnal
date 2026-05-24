'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, Loader2, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

const BUCKET = 'trade-screenshots'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const URL_TTL = 3600 // 1 jam

interface Props {
  tradeId: string
  userId: string
  screenshots: string[]
  onChange: (paths: string[]) => void
  /** Kalau true, hanya tampil thumbnail (tanpa tombol upload/delete) */
  readOnly?: boolean
}

export default function ScreenshotUploader({ tradeId, userId, screenshots, onChange, readOnly }: Props) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [lightbox, setLightbox] = useState<string | null>(null)

  // Generate signed URLs untuk semua screenshot
  useEffect(() => {
    let alive = true
    if (screenshots.length === 0) {
      setUrls({})
      return
    }
    supabase.storage
      .from(BUCKET)
      .createSignedUrls(screenshots, URL_TTL)
      .then(({ data }: { data: Array<{ signedUrl: string; path: string | null }> | null }) => {
        if (!alive || !data) return
        const map: Record<string, string> = {}
        data.forEach((item, i: number) => {
          if (item.signedUrl) map[screenshots[i]] = item.signedUrl
        })
        setUrls(map)
      })
    return () => { alive = false }
  }, [screenshots, supabase])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const fileArr = Array.from(files)

    // Validasi
    for (const f of fileArr) {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} terlalu besar`, { description: 'Maksimal 5 MB per file' })
        return
      }
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} bukan gambar`)
        return
      }
    }

    setUploading(true)
    const newPaths: string[] = []
    for (const f of fileArr) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? 'png'
      const filename = `${crypto.randomUUID()}.${ext}`
      const path = `${userId}/${tradeId}/${filename}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, f, {
        contentType: f.type,
        upsert: false,
      })
      if (error) {
        toast.error(`Gagal upload ${f.name}`, { description: error.message })
        continue
      }
      newPaths.push(path)
    }
    setUploading(false)

    if (newPaths.length > 0) {
      onChange([...screenshots, ...newPaths])
      toast.success(`${newPaths.length} screenshot ditambahkan`)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(path: string) {
    setDeleting(path)
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    setDeleting(null)
    if (error) {
      toast.error('Gagal hapus screenshot', { description: error.message })
      return
    }
    onChange(screenshots.filter(p => p !== path))
    toast.success('Screenshot dihapus')
  }

  return (
    <div className="space-y-2">
      {/* Thumbnails grid */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {screenshots.map(path => {
            const url = urls[path]
            return (
              <div
                key={path}
                className="relative group aspect-square rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden"
              >
                {url ? (
                  <button
                    type="button"
                    onClick={() => setLightbox(url)}
                    className="block w-full h-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                  </div>
                )}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDelete(path)}
                    disabled={deleting === path}
                    className="absolute top-1 right-1 h-6 w-6 rounded-md bg-zinc-900/80 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                    aria-label="Hapus screenshot"
                  >
                    {deleting === path
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Trash2 className="h-3 w-3" />}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Upload button */}
      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full h-9 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-xs"
          >
            {uploading
              ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Mengupload...</>
              : <><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Screenshot (max 5MB)</>
            }
          </Button>
        </>
      )}

      {screenshots.length === 0 && readOnly && (
        <div className="flex items-center gap-2 text-xs text-zinc-600 py-2">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Belum ada screenshot</span>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-zinc-900/80 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-zinc-100"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
