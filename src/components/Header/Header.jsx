import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import './Header.css'

const Header = () => {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-circle">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#000" strokeWidth="3" fill="none"/>
              <circle cx="20" cy="20" r="12" stroke="#000" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="6" fill="#000"/>
              <circle cx="20" cy="20" r="2" fill="#000"/>
            </svg>
          </div>
        </div>
        
        <div className="nav-wrapper">
          <nav 
            className={`nav ${isMenuOpen ? 'nav-open' : ''}`}
            onMouseLeave={handleMouseLeave}
          >
            <div className="nav-item-wrapper">
              <button 
                className="nav-link nav-link-button"
                onClick={() => handleDropdownToggle('products')}
                onMouseEnter={() => setActiveDropdown('products')}
              >
                {t('nav.products')}
                <span className="chevron">{activeDropdown === 'products' ? '▲' : '▼'}</span>
              </button>
              {activeDropdown === 'products' && (
                <div className="dropdown-menu products-dropdown">
                  <div className="dropdown-content">
                    <div className="dropdown-categories">
                      <button className="category-item active">• Voice Assistant</button>
                      <button className="category-item">AI Triage</button>
                      <button className="category-item">Teleconsult</button>
                    </div>
                    <div className="dropdown-services">
                      <div className="service-column">
                        <a href="#voice-dev" className="service-link">AI Voice Agent</a>
                        <a href="#mcp-server" className="service-link">MCP Server</a>
                        <a href="#hire-ai" className="service-link">Hire AI Developer</a>
                      </div>
                      <div className="service-column">
                        <a href="#ai-consult" className="service-link">AI Consultation</a>
                        <a href="#llm" className="service-link">Large Language Model</a>
                        <a href="#visual-analysis" className="service-link">Visual Analysis</a>
                      </div>
                      <div className="service-column">
                        <a href="#chatbot" className="service-link">AI Chatbot</a>
                        <a href="#nlp" className="service-link">Natural Language Processing</a>
                        <a href="#deep-learning" className="service-link">Deep Learning</a>
                      </div>
                      <div className="service-column">
                        <a href="#generative-ai" className="service-link">Generative AI</a>
                        <a href="#predictive" className="service-link">Predictive Modelling</a>
                        <a href="#clinical-triage" className="service-link">Clinical Triage</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="nav-item-wrapper">
              <button 
                className="nav-link nav-link-button"
                onClick={() => handleDropdownToggle('company')}
                onMouseEnter={() => setActiveDropdown('company')}
              >
                {t('nav.about')}
                <span className="chevron">{activeDropdown === 'company' ? '▲' : '▼'}</span>
              </button>
              {activeDropdown === 'company' && (
                <div className="dropdown-menu company-dropdown">
                  <div className="dropdown-content">
                    <a href="#about-us" className="dropdown-link">About Us</a>
                    <a href="#team" className="dropdown-link">Our Team</a>
                    <a href="#mission" className="dropdown-link">Mission & Vision</a>
                    <a href="#careers" className="dropdown-link">Careers</a>
                  </div>
                </div>
              )}
            </div>

            <a href="#blog" className="nav-link nav-link-button">
              {t('nav.blog')}
            </a>

            <a href="#careers" className="nav-link nav-link-button">
              {t('nav.careers')}
            </a>

            <a href="#api" className="nav-link nav-link-button">
              {t('nav.api')}
            </a>

            <a href="#demo" className="nav-link nav-link-cta">
              {t('nav.requestDemo')}
              <span className="arrow-icon">↗</span>
            </a>

            <LanguageSwitcher />
          </nav>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
