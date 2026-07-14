import { useT } from '@/hooks/useT'
import StrategyChart from '@/components/StrategyChart'

export default function StrategyPage() {
  const t = useT()
  return (
    <div className="table-main" style={{ paddingBottom: 40 }}>
      <h2
        style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 900,
          color: 'var(--brass)',
          fontSize: '1.2rem',
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        {t('chartT')}
      </h2>
      <StrategyChart />
    </div>
  )
}
