import React from 'react'
import { useTranslation } from 'react-i18next'
import './Hero.css'

const Hero = () => {
  const { t } = useTranslation()

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-cta">
            <a href="#get-started" className="btn btn-primary">
              {t('hero.cta1')}
            </a>
            <a href="#learn-more" className="btn btn-secondary">
              {t('hero.cta2')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

