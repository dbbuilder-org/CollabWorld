'use client'

import { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

export interface MuxVideoPlayerProps {
  playbackId: string
  thumbnailUrl?: string
  title?: string
  className?: string
}

export default function MuxVideoPlayer({
  playbackId,
  thumbnailUrl,
  title,
  className,
}: MuxVideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className ?? ''}`}>
      {/* Skeleton placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 bg-zinc-900 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-700 border-t-purple-500 animate-spin" />
        </div>
      )}

      <MuxPlayer
        streamType="on-demand"
        playbackId={playbackId}
        metadata={{ video_title: title }}
        poster={thumbnailUrl}
        preload="metadata"
        onLoadedMetadata={() => setIsLoaded(true)}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
