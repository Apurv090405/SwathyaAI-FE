import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeToggle({ theme, onToggle }) {
    return (
        <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-border/70 bg-background/80 backdrop-blur"
            onClick={onToggle}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    )
}
