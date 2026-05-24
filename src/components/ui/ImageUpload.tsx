'use client'

import { useRef, useState } from 'react'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  folder?: string
  label?: string
  aspectRatio?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = 'unwomen',
  label = 'Upload Image',
  aspectRatio = 'aspect-video',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, progress } = useCloudinaryUpload()
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB')
      return
    }

    setPreview(URL.createObjectURL(file))
    try {
      const url = await upload(file, folder)
      onChange(url)
      toast.success('Image uploaded!')
    } catch {
      toast.error('Upload failed — check your Cloudinary config')
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const displayUrl = preview ?? value

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> {label}
        </p>
      )}

      <div
        className={`relative w-full ${aspectRatio} rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
            <Upload className="w-6 h-6" />
            <p className="text-xs font-medium">Click or drag to upload</p>
            <p className="text-[10px]">PNG, JPG, WEBP · max 10 MB</p>
          </div>
        )}

        {/* Upload progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
            <div className="w-32 bg-white/20 rounded-full h-1.5">
              <div className="bg-blue-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-white text-xs font-semibold">{progress}%</p>
          </div>
        )}

        {/* Remove button */}
        {displayUrl && !uploading && (onRemove || true) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setPreview(null)
              if (onRemove) onRemove()
              else onChange('')
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

/** Multi-image upload — manages a list of URLs */
interface MultiImageUploadProps {
  values: string[]
  onChange: (urls: string[]) => void
  folder?: string
  max?: number
  label?: string
}

export function MultiImageUpload({ values, onChange, folder = 'unwomen', max = 5, label }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, progress } = useCloudinaryUpload()

  const handleFile = async (file: File) => {
    if (values.length >= max) { toast.error(`Max ${max} images`); return }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return }
    try {
      const url = await upload(file, folder)
      onChange([...values, url])
      toast.success('Image uploaded!')
    } catch {
      toast.error('Upload failed')
    }
  }

  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx))

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> {label}
        </p>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {values.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group">
            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-3 h-3" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-full">Cover</span>
            )}
          </div>
        ))}

        {values.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center gap-1 hover:border-blue-400 transition-colors text-gray-400 dark:text-gray-500 disabled:opacity-50">
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[9px]">{progress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-[9px] font-medium">Add image</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
      <p className="text-[10px] text-gray-400 dark:text-gray-500">{values.length}/{max} images · First image is used as cover</p>
    </div>
  )
}
