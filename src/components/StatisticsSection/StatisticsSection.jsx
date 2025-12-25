import { useTranslation } from 'react-i18next'
import './StatisticsSection.css'

const StatisticsSection = () => {
  const { t } = useTranslation()

  const statistics = [
    {
      key: 'totalCalls',
      label: 'CALLS',
      value: '2.3M+'
    },
    {
      key: 'criticalCases',
      label: 'CRITICAL CASES',
      value: '112K+'
    },
    {
      key: 'activeDoctors',
      label: 'DOCTORS',
      value: '11.8K'
    }
  ]

  return (
    <section className="statistics-section">
      <div className="statistics-container">
        <div className="statistics-grid">
          {statistics.map((stat) => (
            <div key={stat.key} className="stat-item">
              <div className="stat-label">{t(`statistics.${stat.key}.label`)}</div>
              <div className="stat-value">{t(`statistics.${stat.key}.value`)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatisticsSection
