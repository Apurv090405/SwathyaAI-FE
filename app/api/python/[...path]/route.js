import { NextResponse } from 'next/server'

const PYTHON_API_BASE =
    process.env.PYTHON_API_BASE_URL || process.env.NEXT_PUBLIC_SWASTHYA_API_URL || 'http://localhost:8000'

async function handler(request, { params }) {
    const path = (params.path || []).join('/')
    const url = new URL(`${PYTHON_API_BASE.replace(/\/$/, '')}/${path}`)

    const incomingUrl = new URL(request.url)
    incomingUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value)
    })

    const bodyAllowed = request.method !== 'GET' && request.method !== 'HEAD'
    const upstream = await fetch(url.toString(), {
        method: request.method,
        headers: {
            'Content-Type': request.headers.get('content-type') || 'application/json',
        },
        body: bodyAllowed ? await request.text() : undefined,
    })

    const text = await upstream.text()
    return new NextResponse(text, {
        status: upstream.status,
        headers: {
            'Content-Type': upstream.headers.get('content-type') || 'application/json',
        },
    })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
