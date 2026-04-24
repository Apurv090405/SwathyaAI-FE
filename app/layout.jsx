import '../src/styles/global.css'
import '../src/styles/App.css'
import Providers from './providers'

export const metadata = {
    title: 'SwasthyaAI',
    description: 'Smart Voice + Agentic Health Assistant',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
