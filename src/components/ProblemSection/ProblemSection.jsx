import React from 'react'
import { useTranslation } from 'react-i18next'
import './ProblemSection.css'

const ProblemSection = () => {
  const { t } = useTranslation()

  const stats = [
    { key: 'doctorRatio' },
    { key: 'phcStaffing' },
    { key: 'distance' },
    { key: 'connectivity' }
  ]

  const highlightNumbers = (text) => {
    // Match numbers, percentages, and number ranges (e.g., "15-20", "30-40%")
    const parts = text.split(/(\d+[-\d]*%?|\d+[-\d]+)/g)
    
    return parts.map((part, index) => {
      // Check if part is a number, percentage, or number range
      if (/^\d+[-\d]*%?$/.test(part) || /^\d+[-\d]+$/.test(part)) {
        return (
          <span key={index} className="stat-number">
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <section className="problem-section">
      <div className="problem-container">
        <div className="problem-content">
          <h2 className="problem-title">{t('problem.title')}</h2>
          <p className="problem-description">{t('problem.description')}</p>
          
          <div className="problem-stats">
            {stats.map((stat) => (
              <div key={stat.key} className="stat-card">
                <div className="stat-text">
                  {highlightNumbers(t(`problem.stats.${stat.key}`))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
