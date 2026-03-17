import { useCallback, useState } from 'react'
import { FlvPlayer } from './FlvPlayer'
import { useTheme } from './useTheme'

const DEFAULT_URL = 'http://10.170.96.153:8081/LesA/113503.flv'
const INPUT_ID = 'flv-url-input'

/** Read FLV URL from /play?url=... or /play?flv=... (only on pathname /play). */
function getInitialFromSearch(): { inputUrl: string; autoPlayUrl: string | null } {
  if (typeof window === 'undefined') return { inputUrl: DEFAULT_URL, autoPlayUrl: null }
  if (window.location.pathname !== '/play') return { inputUrl: DEFAULT_URL, autoPlayUrl: null }
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('url') ?? params.get('flv')
  if (!raw) return { inputUrl: DEFAULT_URL, autoPlayUrl: null }
  const decoded = decodeURIComponent(raw.trim())
  if (!decoded.startsWith('http://') && !decoded.startsWith('https://')) {
    return { inputUrl: decoded, autoPlayUrl: null }
  }
  return { inputUrl: decoded, autoPlayUrl: decoded }
}

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function IconClear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [inputUrl, setInputUrl] = useState(() => getInitialFromSearch().inputUrl)
  const [playUrl, setPlayUrl] = useState<string | null>(() => getInitialFromSearch().autoPlayUrl)
  const [userTriggeredPlay, setUserTriggeredPlay] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlay = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputUrl.trim()
    if (!trimmed) {
      setError('Please enter an FLV URL')
      return
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('URL must start with http:// or https://')
      return
    }
    setError(null)
    setUserTriggeredPlay(true)
    setPlayUrl(trimmed)
    const search = '?url=' + encodeURIComponent(trimmed)
    window.history.pushState(null, '', '/play' + search)
  }, [inputUrl])

  const handleClear = useCallback(() => {
    setPlayUrl(null)
    setUserTriggeredPlay(false)
    setError(null)
    window.history.pushState(null, '', '/play')
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1 className="app-title">FLV Proxy Player</h1>
          <button
            type="button"
            onClick={toggleTheme}
            className="app-theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </div>
        <p className="app-subtitle">
          Enter an FLV URL reachable from the backend. The server will stream it here for playback.
        </p>
      </header>

      <section className="app-card" aria-labelledby="input-heading">
        <h2 id="input-heading" className="visually-hidden">Stream source</h2>
        <form onSubmit={handlePlay} className="app-form">
          <label htmlFor={INPUT_ID} className="app-label">
            FLV URL
          </label>
          <input
            id={INPUT_ID}
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
            placeholder="https://example.com/path/to/stream.flv"
            className="app-input"
            autoComplete="url"
            aria-invalid={!!error}
            aria-describedby={error ? 'input-error' : undefined}
          />
          <div className="app-actions">
            <button type="submit" className="app-btn app-btn-primary">
              <IconPlay />
              <span>Play</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="app-btn app-btn-secondary"
              aria-label="Clear and stop playback"
            >
              <IconClear />
              <span>Clear</span>
            </button>
          </div>
        </form>

        {error && (
          <div
            id="input-error"
            role="alert"
            className="app-error"
          >
            {error}
          </div>
        )}
      </section>

      {playUrl && (
        <section className="app-video-section" aria-label="Video playback">
          <FlvPlayer
            url={playUrl}
            autoPlay={userTriggeredPlay}
            onError={(msg) => setError(msg)}
          />
        </section>
      )}

      {!playUrl && !error && (
        <div className="app-placeholder" aria-hidden>
          <p className="app-placeholder-text">Enter an FLV URL above and click Play to start.</p>
        </div>
      )}
    </div>
  )
}
