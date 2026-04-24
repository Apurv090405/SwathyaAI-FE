import React from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { SUPPORTED_UI_LANGUAGES } from '../../data/supportedLanguages'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const languages = SUPPORTED_UI_LANGUAGES

const LanguageSwitcher = () => {
    const { i18n } = useTranslation()

    const currentLanguage =
        languages.find(
            (lang) => i18n.language === lang.code || i18n.language?.split('-')[0] === lang.code
        ) || languages[0]

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 rounded-full border-border px-3 text-foreground shadow-sm"
                    aria-label="Change language"
                >
                    <span className="text-xs font-semibold">{currentLanguage.code.toUpperCase()}</span>
                    <ChevronDown className="size-3.5 opacity-60" aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[11rem]">
                {languages.map((lang) => {
                    const active =
                        i18n.language === lang.code || i18n.language?.split('-')[0] === lang.code
                    return (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn('flex cursor-pointer items-center justify-between gap-3', active && 'bg-accent')}
                        >
                            <span className="font-medium">{lang.native}</span>
                            <span className="text-xs text-muted-foreground">{lang.name}</span>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default LanguageSwitcher
