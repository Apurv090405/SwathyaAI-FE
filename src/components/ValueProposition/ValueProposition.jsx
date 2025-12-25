import React from 'react'
import { useTranslation } from 'react-i18next'
import './ValueProposition.css'

const ValueProposition = () => {
  const { t } = useTranslation()

  return (
    <section className="value-prop">
      <div className="value-prop-container">
        <div className="value-prop-content">
          <div className="value-prop-image">
            <img 
              src="/images/ImmHealthcAccess.jpg" 
              alt="India Healthcare Access Map" 
              className="healthcare-map-image"
            />
          </div>
          
          <div className="value-prop-text">
            <h2 className="value-prop-title">
              {t('valueProp.title')}
            </h2>
            <p className="value-prop-subtitle">
              {t('valueProp.subtitle')}
            </p>
            <a href="#learn-more" className="value-prop-button">
              {t('valueProp.button')}
            </a>
            <div className="value-prop-pattern">
              <span className="pattern-item">XIX</span>
              <span className="pattern-item">XIX</span>
              <span className="pattern-item">XIX</span>
              <span className="pattern-item active">XIX</span>
              <span className="pattern-item active">XIX</span>
              <span className="pattern-item active">XIX</span>
              <span className="pattern-item">XIX</span>
              <span className="pattern-item">XIX</span>
              <span className="pattern-item">XIX</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ValueProposition
