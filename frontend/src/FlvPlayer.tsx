import flvjs from 'flv.js'
import { useEffect, useRef } from 'react'

// Proxy URL: same origin, backend streams the FLV
function proxyUrl(flvUrl: string): string {
  return `/api/v1/flv/proxy?url=${encodeURIComponent(flvUrl)}`
}

// Suppress known flv.js warnings: "unconsumed data when flush buffer" (VOD tail) and "MediaSource onSourceEnded"
if (flvjs.LoggingControl) {
  flvjs.LoggingControl.applyConfig({ enableWarn: false })
}

interface FlvPlayerProps {
  url: string
  /** When true, play with sound (user clicked form). When false, open via link: play muted so browser allows autoplay; user can unmute via video controls. */
  autoPlay?: boolean
  onError?: (message: string) => void
}

export function FlvPlayer({ url, autoPlay = false, onError }: FlvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!flvjs.isSupported()) {
      onError?.('FLV is not supported in this browser')
      return
    }

    const sourceURL = proxyUrl(url)
    const player = flvjs.createPlayer(
      { type: 'flv', url: sourceURL, hasAudio: true, hasVideo: true },
      {
        isLive: false,
        // Load full response for VOD to avoid "unconsumed data remain when flush buffer" at end
        lazyLoad: false,
      }
    )

    player.attachMediaElement(video)
    player.load()

    let aborted = false
    const safePlay = (muted: boolean) => {
      if (muted) video.muted = true
      const p = video.play()
      if (p !== undefined) {
        p.catch((err: unknown) => {
          if (aborted) return
          if (err instanceof Error && err.name === 'AbortError') return
          if (err instanceof Error && err.name === 'NotAllowedError') {
            onError?.('Playback was blocked. Click the play button on the video.')
            return
          }
          if (err instanceof Error && err.name === 'NotSupportedError') {
            onError?.('Format or codec not supported by the browser.')
            return
          }
          onError?.(err instanceof Error ? err.message : 'Failed to play stream.')
        })
      }
    }

    const onCanPlay = () => {
      safePlay(!autoPlay)
    }
    const onErr = () => {
      const mediaError = video.error
      if (mediaError) {
        // MediaError.MEDIA_ERR_ABORTED=1, NETWORK=2, DECODE=3, SRC_NOT_SUPPORTED=4
        switch (mediaError.code) {
          case 2:
            onError?.('Network error while loading. Check backend and URL.')
            return
          case 4:
            onError?.('Stream format not supported or invalid FLV.')
            return
          case 3:
            onError?.('Decode error. The stream may be corrupted or unsupported.')
            return
          default:
            onError?.(mediaError.message || 'Failed to load stream.')
            return
        }
      }
      onError?.('Failed to load stream. Check the URL and backend connectivity.')
    }

    video.addEventListener('canplay', onCanPlay, { once: true })
    video.addEventListener('error', onErr)

    return () => {
      aborted = true
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onErr)
      player.destroy()
    }
  }, [url, autoPlay, onError])

  return (
    <div className="flv-player">
      <video
        ref={videoRef}
        controls
        className="flv-player-video"
      />
    </div>
  )
}
