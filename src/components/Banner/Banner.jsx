import React from 'react'
import { useTranslation } from 'react-i18next'
import './Banner.css'

const Banner = () => {
  const { t } = useTranslation()

  return (
    <div className="banner">
      <div className="banner-content">
        <span className="banner-text">{t('banner.text')}</span>
      </div>
    </div>
  )
}

export default Banner

