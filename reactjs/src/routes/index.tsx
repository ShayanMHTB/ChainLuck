import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{t('pages.home.title')}</h1>
      <p className="text-muted-foreground max-w-lg">{t('pages.home.subtitle')}</p>
    </div>
  )
}
