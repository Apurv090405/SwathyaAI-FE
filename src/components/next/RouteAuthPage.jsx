'use client'

import { useRouter } from 'next/navigation'
import AuthPage from '@/views/AuthPage'

export default function RouteAuthPage({ mode }) {
    const router = useRouter()

    return (
        <AuthPage
            forcedMode={mode}
            onRouteChange={(route) => {
                if (route === 'home') router.push('/')
                else if (route === 'signup') router.push('/signup')
                else if (route === 'signin') router.push('/signin')
                else if (route === 'dashboard') router.push('/dashboard')
            }}
        />
    )
}
