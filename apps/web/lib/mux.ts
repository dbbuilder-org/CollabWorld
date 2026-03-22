import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export interface MuxAsset {
  id: string
  status: string
  playback_ids?: Array<{ id: string; policy: string }>
  duration?: number
}

/**
 * Creates a Mux direct upload URL.
 * Max file size 2GB, mp4 + mov passthrough.
 */
export async function createDirectUploadUrl(
  corsOrigin: string
): Promise<{ uploadId: string; uploadUrl: string }> {
  const upload = await mux.video.uploads.create({
    cors_origin: corsOrigin,
    new_asset_settings: {
      playback_policy: ['public'],
      passthrough: 'collabworld',
    },
    timeout: 3600,
  })

  return {
    uploadId: upload.id,
    uploadUrl: upload.url,
  }
}

/**
 * Retrieves a Mux asset by ID. Returns null if not found.
 */
export async function getAsset(assetId: string): Promise<MuxAsset | null> {
  try {
    const asset = await mux.video.assets.retrieve(assetId)
    return asset as MuxAsset
  } catch {
    return null
  }
}

/**
 * Deletes a Mux asset by ID.
 */
export async function deleteAsset(assetId: string): Promise<void> {
  await mux.video.assets.delete(assetId)
}
