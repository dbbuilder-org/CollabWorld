'use client'

import { useRef, useState } from 'react'
import * as UpChunk from '@mux/upchunk'

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024 // 2GB
const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime']

export interface VideoUploaderProps {
  uploadUrl: string
  onProgress: (percent: number) => void
  onSuccess: () => void
  onError: (err: Error) => void
}

type UploaderState = 'idle' | 'selected' | 'uploading' | 'success' | 'error'

export default function VideoUploader({
  uploadUrl,
  onProgress,
  onSuccess,
  onError,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploaderState>('idle')
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage('Only MP4 and MOV files are accepted.')
      setState('error')
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('File size exceeds the 2GB limit.')
      setState('error')
      return
    }

    setSelectedFile(file)
    setState('selected')
    setErrorMessage(null)
  }

  function startUpload() {
    if (!selectedFile) return

    setState('uploading')
    setProgress(0)

    const upload = UpChunk.createUpload({
      endpoint: uploadUrl,
      file: selectedFile,
      chunkSize: 5120, // 5MB chunks
    })

    upload.on('progress', (e: { detail: number }) => {
      const pct = Math.round(e.detail)
      setProgress(pct)
      onProgress(pct)
    })

    upload.on('success', () => {
      setState('success')
      onSuccess()
    })

    upload.on('error', (e: { detail: Error }) => {
      const err = e.detail instanceof Error ? e.detail : new Error(String(e.detail))
      setErrorMessage(err.message)
      setState('error')
      onError(err)
    })
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-400 py-3">
        <span className="text-2xl">✓</span>
        <span className="text-sm font-medium">Upload complete</span>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="text-red-400 text-sm py-3">
        <p>Upload failed: {errorMessage}</p>
        <button
          type="button"
          onClick={() => {
            setState('idle')
            setErrorMessage(null)
            setSelectedFile(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
          className="mt-2 text-xs underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (state === 'uploading') {
    return (
      <div className="space-y-2 py-3" aria-label="upload-progress">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>Uploading…</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime"
          onChange={handleFileChange}
          className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
          aria-label="video-file-input"
        />
        <p className="mt-1 text-xs text-zinc-500">MP4 or MOV, max 2GB</p>
      </div>

      {state === 'selected' && selectedFile && (
        <div className="text-xs text-zinc-400">
          Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
          <button
            type="button"
            onClick={startUpload}
            className="ml-3 text-purple-400 underline"
          >
            Upload now
          </button>
        </div>
      )}
    </div>
  )
}
