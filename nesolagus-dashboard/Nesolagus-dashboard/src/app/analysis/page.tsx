// src/app/analysis/page.tsx
import { getAnalysis } from '@/lib/data'
import ChartFunnel from '@/components/ChartFunnel'
import SpectrumDonut from '@/components/SpectrumDonut'

export const dynamic = 'force-dynamic'

export default async function AnalysisPage() {
  const data = await getAnalysis()

  const { kpis, keyDrivers = [], riskSignals = [], engagementSpectrum = [] } = data ?? {}
  const { surveyCount, avgSentiment, optInRate } = kpis ?? {}

  return (
    <main className="min-h-screen bg-CottonKnit text-DeepestSea p-6 space-y-8">
      <h1 className="sr-only">Analysis</h1>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Surveys Analyzed" value={surveyCount ?? '—'} />
        <Kpi label="Avg. Sentiment" value={avgSentiment != null ? `${avgSentiment}/10` : '—'} />
        <Kpi label="Opt-in Rate" value={optInRate != null ? `${optInRate}%` : '—'} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Key Drivers">
          {keyDrivers.length ? <ChartFunnel data={keyDrivers} /> : <Empty text="No driver data." />}
        </Panel>

        <Panel title="Risk Signals">
          {riskSignals.length ? <ChartFunnel data={riskSignals} /> : <Empty text="No risk data." />}
        </Panel>
      </section>

      <Panel title="Engagement Spectrum">
        {engagementSpectrum.length ? (
          <SpectrumDonut data={engagementSpectrum} />
        ) : (
          <Empty text="No spectrum data." />
        )}
      </Panel>
    </main>
  )
}

/* UI bits */
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-sm font-semibold mb-2">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-RiverRock">{text}</p>
}
