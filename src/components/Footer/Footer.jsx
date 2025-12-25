import React from 'react'
import { useTranslation } from 'react-i18next'
import './Footer.css'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">swasthyaai</div>
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <a href="#experience" className="footer-cta">
              EXPERIENCE SWASTHYAAI ↗
            </a>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-column-title">{t('footer.products')}</h4>
              <ul className="footer-list">
                <li><a href="#voice-assistant">Voice Assistant</a></li>
                <li><a href="#ai-triage">AI Triage</a></li>
                <li><a href="#teleconsult">Teleconsult</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-column-title">{t('footer.company')}</h4>
              <ul className="footer-list">
                <li><a href="#about">About Us</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-column-title">{t('footer.resources')}</h4>
              <ul className="footer-list">
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#api">API</a></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">{t('footer.copyright')}</p>
          <div className="footer-legal">
            <a href="#terms">Terms of Use</a>
            <a href="#privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

