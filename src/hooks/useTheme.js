import { useEffect, useState } from 'react'

const THEME_KEY = 'swasthya-theme'

function resolveBrowserTheme() {
    const savedTheme = window.localStorage.getItem(THEME_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
    // Keep SSR and first client render deterministic.
    const [theme, setTheme] = useState('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setTheme(resolveBrowserTheme())
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        const root = document.documentElement
        root.classList.toggle('dark', theme === 'dark')
        window.localStorage.setItem(THEME_KEY, theme)
    }, [mounted, theme])

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

    return { theme, setTheme, toggleTheme, mounted }
}
