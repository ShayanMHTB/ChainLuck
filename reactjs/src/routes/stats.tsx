import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/stats')({
  component: StatsPage,
})

function StatsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.stats.title')}</h1>
      <p className="text-muted-foreground">{t('pages.stats.subtitle')}</p>
    </div>
  )
}
