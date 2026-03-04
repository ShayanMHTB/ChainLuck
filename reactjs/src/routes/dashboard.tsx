import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.dashboard.title')}</h1>
      <p className="text-muted-foreground">{t('pages.dashboard.subtitle')}</p>
    </div>
  )
}
