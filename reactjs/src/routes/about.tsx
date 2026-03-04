import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.about.title')}</h1>
      <p className="text-muted-foreground">{t('pages.about.subtitle')}</p>
    </div>
  )
}
