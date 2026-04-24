import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import './Header.css'

const Header = () => {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const headerRef = useRef(null)

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  useGSAP(() => {
    // Header slides down on load
    gsap.fromTo(headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
    )

    // Animate nav links with stagger - use querySelectorAll within scope
    const navLinks = headerRef.current.querySelectorAll('.nav-link, .nav-item-wrapper')
    gsap.fromTo(navLinks,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.4 }
    )

  }, { scope: headerRef })

  return (
    <header className="header" ref={headerRef}>
      <div className="header-container">
        <div className="logo">
          <div className="logo-circle">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#000" strokeWidth="3" fill="none" />
              <circle cx="20" cy="20" r="12" stroke="#000" strokeWidth="2" fill="none" />
              <circle cx="20" cy="20" r="6" fill="#000" />
              <circle cx="20" cy="20" r="2" fill="#000" />
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
                <div className="dropdown-menu">
                  <div className="dropdown-content">
                    <a href="#voice-assistant" className="dropdown-link">Voice Assistant</a>
                    <a href="#ai-triage" className="dropdown-link">AI Triage</a>
                    <a href="#teleconsult" className="dropdown-link">Teleconsult</a>
                    <a href="#ai-chatbot" className="dropdown-link">AI Chatbot</a>
                    <a href="#analytics" className="dropdown-link">Analytics Dashboard</a>
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
                <div className="dropdown-menu">
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

            <LanguageSwitcher />

            <a href="/signin" className="nav-link nav-link-login">
              Login
            </a>

            <a href="#demo" className="nav-link nav-link-cta">
              {t('nav.requestDemo')}
              <span className="arrow-icon">↗</span>
            </a>
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
