import React from 'react'
import './LogoBanner.css'

const LogoBanner = () => {
  const logos = [
    {
      name: 'Ministry of Skill Development',
      hindi: 'कौशल विकास और उद्यमशीलता मंत्रालय',
      english: 'MINISTRY OF SKILL DEVELOPMENT AND ENTREPRENEURSHIP',
      type: 'government'
    },
    {
      name: 'NITI Aayog',
      type: 'government'
    },
    {
      name: 'Neowise',
      subtitle: 'A DECENTRO COMPANY',
      type: 'company'
    },
    {
      name: 'Godrej',
      type: 'company'
    },
    {
      name: 'Infosys',
      type: 'company'
    },
    {
      name: 'Aadhaar',
      type: 'company'
    }
  ]

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos]

  return (
    <section className="logo-banner-section">
      <div className="logo-banner-container">
        <div className="logo-banner-track">
          {duplicatedLogos.map((logo, index) => (
            <div key={index} className="logo-item">
              {logo.type === 'government' && logo.name === 'Ministry of Skill Development' ? (
                <div className="logo-content government-logo">
                  <div className="emblem">🇮🇳</div>
                  <div className="logo-text">
                    <div className="hindi-text">{logo.hindi}</div>
                    <div className="english-text">{logo.english}</div>
                  </div>
                </div>
              ) : logo.name === 'NITI Aayog' ? (
                <div className="logo-content government-logo">
                  <div className="emblem">🇮🇳</div>
                  <div className="logo-text">{logo.name}</div>
                </div>
              ) : logo.name === 'Neowise' ? (
                <div className="logo-content company-logo">
                  <div className="logo-icon">📚</div>
                  <div className="logo-text">
                    <div className="logo-name">{logo.name}</div>
                    <div className="logo-subtitle">{logo.subtitle}</div>
                  </div>
                </div>
              ) : logo.name === 'Godrej' ? (
                <div className="logo-content company-logo cursive">
                  <div className="logo-text">{logo.name}</div>
                </div>
              ) : logo.name === 'Infosys' ? (
                <div className="logo-content company-logo">
                  <div className="logo-text infosys">{logo.name}</div>
                </div>
              ) : logo.name === 'Aadhaar' ? (
                <div className="logo-content company-logo">
                  <div className="aadhaar-icon">☀️</div>
                  <div className="logo-text">{logo.name}</div>
                </div>
              ) : (
                <div className="logo-content company-logo">
                  <div className="logo-text">{logo.name}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LogoBanner

