import { useCallback, useEffect, useState } from 'react'

/** The two token sets the app can show. */
export type Theme = 'light' | 'dark'

const KEY = 'stackforge-theme'
const systemDark = () => matchMedia('(prefers-color-scheme: dark)').matches

/** The saved choice, or the system setting until the user picks one. index.html applies it before first paint. */
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // storage blocked: fall through to the system setting
  }
  return systemDark() ? 'dark' : 'light'
}

/** Light or dark, remembered per browser; `.dark` on <html> is what every token keys off. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(KEY, next)
      } catch {
        // not persisted, still applied for this session
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
