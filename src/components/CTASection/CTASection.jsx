import React from 'react'
import { useTranslation } from 'react-i18next'
import './CTASection.css'

const CTASection = () => {
  const { t } = useTranslation()

  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">{t('cta.title')}</h2>
          <p className="cta-subtitle">{t('cta.subtitle')}</p>
          <a href="#get-started" className="btn btn-cta">
            {t('cta.button')}
          </a>
        </div>
      </div>
    </section>
  )
}

export default CTASection

