'use client'

import '@/i18n/config.js'
import { AuthProvider } from '@/context/AuthContext'

export default function Providers({ children }) {
    return <AuthProvider>{children}</AuthProvider>
}
