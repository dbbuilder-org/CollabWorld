'use client'

import { useState } from 'react'
import VideoUploader from './VideoUploader'

interface EntrySubmissionFormProps {
  contestId: string
}

type FormState = 'idle' | 'uploading' | 'success' | 'error'

export default function EntrySubmissionForm({ contestId }: EntrySubmissionFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const isUploading = formState === 'uploading'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTitleError(null)
    setFileError(null)
    setGeneralError(null)

    if (!title.trim()) {
      setTitleError('Title is required.')
      return
    }

    try {
      const res = await fetch('/api/v1/entries/upload-url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contestId, title: title.trim(), description: description.trim() || undefined }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setGeneralError(data.error ?? 'Failed to create upload URL')
        setFormState('error')
        return
      }

      const data = (await res.json()) as { uploadUrl: string; entryId: string }
      setUploadUrl(data.uploadUrl)
      setFormState('uploading')
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Network error')
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-green-900/20 border border-green-700 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-lg font-bold text-green-400 mb-2">Entry submitted!</h3>
        <p className="text-zinc-400 text-sm">Your entry is pending review. We&apos;ll notify you once it&apos;s approved.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="entry-title" className="block text-sm font-medium text-zinc-300 mb-1">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="entry-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your entry a title"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
          disabled={isUploading}
          aria-label="entry-title"
        />
        {titleError && (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {titleError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="entry-description" className="block text-sm font-medium text-zinc-300 mb-1">
          Description
        </label>
        <textarea
          id="entry-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about your entry (optional)"
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
          disabled={isUploading}
          aria-label="entry-description"
        />
      </div>

      {generalError && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
          {generalError}
        </div>
      )}

      {fileError && (
        <div className="text-red-400 text-sm">
          {fileError}
        </div>
      )}

      {uploadUrl ? (
        <div>
          <p className="text-sm font-medium text-zinc-300 mb-2">Upload your video</p>
          <VideoUploader
            uploadUrl={uploadUrl}
            onProgress={(pct) => setUploadProgress(pct)}
            onSuccess={() => setFormState('success')}
            onError={(err) => {
              setGeneralError(err.message)
              setFormState('error')
            }}
          />
          {isUploading && (
            <div className="mt-2 text-xs text-zinc-500">
              Upload progress: {uploadProgress}%
            </div>
          )}
        </div>
      ) : (
        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
        >
          {isUploading ? 'Preparing upload…' : 'Submit Entry'}
        </button>
      )}
    </form>
  )
}
