import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock @mux/upchunk
vi.mock('@mux/upchunk', () => ({
  createUpload: vi.fn(() => ({
    on: vi.fn(),
  })),
}))

// Mock fetch
global.fetch = vi.fn()

import EntrySubmissionForm from '@/components/entries/EntrySubmissionForm'

describe('EntrySubmissionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ uploadUrl: 'https://upload.mux.com/test', entryId: 'entry-001' }),
    })
  })

  it('renders title and description fields', () => {
    render(<EntrySubmissionForm contestId="contest-uuid-001" />)
    expect(screen.getByLabelText('entry-title')).toBeInTheDocument()
    expect(screen.getByLabelText('entry-description')).toBeInTheDocument()
  })

  it('shows error if title is empty on submit', async () => {
    render(<EntrySubmissionForm contestId="contest-uuid-001" />)
    const submitBtn = screen.getByRole('button', { name: /submit entry/i })
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(screen.getByText('Title is required.')).toBeInTheDocument()
    })
  })

  it('does not call fetch when title is missing', async () => {
    render(<EntrySubmissionForm contestId="contest-uuid-001" />)
    const submitBtn = screen.getByRole('button', { name: /submit entry/i })
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  it('calls fetch with correct body when title is provided', async () => {
    render(<EntrySubmissionForm contestId="contest-uuid-001" />)
    const titleInput = screen.getByLabelText('entry-title')
    await userEvent.type(titleInput, 'My Great Entry')

    const submitBtn = screen.getByRole('button', { name: /submit entry/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/entries/upload-url',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('My Great Entry'),
        })
      )
    })
  })

  it('rejects non-video files in VideoUploader', async () => {
    const { createUpload } = await import('@mux/upchunk')

    // Render submission form, submit with title to get to video upload state
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ uploadUrl: 'https://upload.mux.com/test', entryId: 'entry-001' }),
    })

    const { container } = render(<EntrySubmissionForm contestId="contest-uuid-001" />)

    // We need to separately test VideoUploader's file rejection
    // Render VideoUploader directly for the file type test
    const { default: VideoUploader } = await import('@/components/entries/VideoUploader')
    const { unmount } = render(
      <VideoUploader
        uploadUrl="https://upload.mux.com/test"
        onProgress={vi.fn()}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />
    )

    const fileInput = screen.getByLabelText('video-file-input')
    const badFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [badFile] } })

    await waitFor(() => {
      expect(screen.getByText(/only mp4 and mov/i)).toBeInTheDocument()
    })

    expect(createUpload).not.toHaveBeenCalled()
    unmount()
    void container
  })

  it('shows progress bar after upload starts (mock upchunk)', async () => {
    const { createUpload } = await import('@mux/upchunk')
    ;(createUpload as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return { on: vi.fn() }
    })

    // Render VideoUploader in uploading state
    const { default: VideoUploader } = await import('@/components/entries/VideoUploader')
    const onProgress = vi.fn()

    render(
      <VideoUploader
        uploadUrl="https://upload.mux.com/test"
        onProgress={onProgress}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />
    )

    const fileInput = screen.getByLabelText('video-file-input')
    const videoFile = new File(['video data'], 'test.mp4', { type: 'video/mp4' })

    fireEvent.change(fileInput, { target: { files: [videoFile] } })

    await waitFor(() => {
      expect(screen.getByText(/upload now/i)).toBeInTheDocument()
    })

    const uploadBtn = screen.getByText(/upload now/i)
    fireEvent.click(uploadBtn)

    await waitFor(() => {
      expect(screen.getByLabelText('upload-progress')).toBeInTheDocument()
    })
  })
})
