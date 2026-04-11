import { PageHeader } from '@/components/navigation/Header'
import { AdvisorDashboardView } from '@/components/advisor/AdvisorDashboardView'

export const metadata = {
  title: 'Dashboard | Advisor',
}

export default function AdvisorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos mandatos, oportunidades e fila de trabalho (inclui exemplos de interface)."
      />
      <AdvisorDashboardView />
    </div>
  )
}
