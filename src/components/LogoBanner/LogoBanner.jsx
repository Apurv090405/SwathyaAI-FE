import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import './LogoBanner.css'

const LogoBanner = () => {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

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

  useGSAP(() => {
    // Fade in the section
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    })

    // Speed up animation on scroll
    gsap.to(trackRef.current, {
      '--animation-speed': '15s',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top center',
        end: 'bottom center',
        scrub: 1
      }
    })

  }, { scope: sectionRef })

  return (
    <section className="logo-banner-section" ref={sectionRef}>
      <div className="logo-banner-container">
        <div className="logo-banner-track" ref={trackRef}>
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

