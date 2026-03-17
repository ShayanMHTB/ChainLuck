import { Link } from '@tanstack/react-router'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fa', label: 'فارسی' },
] as const

export function Header() {
  const { t, i18n } = useTranslation()

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-foreground text-sm font-semibold"
            activeProps={{ className: 'text-primary' }}
          >
            ChainLuck
          </Link>
          {(
            [
              { to: '/play', key: 'nav.play' },
              { to: '/dashboard', key: 'nav.dashboard' },
              { to: '/stats', key: 'nav.stats' },
              { to: '/about', key: 'nav.about' },
            ] as const
          ).map(({ to, key }) => (
            <Link
              key={to}
              to={to}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              activeProps={{ className: 'text-foreground' }}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('lang')}>
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGS.map(({ code, label }) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => void i18n.changeLanguage(code)}
                  className={i18n.language === code ? 'font-semibold' : ''}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
