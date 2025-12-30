import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import './ProblemSection.css'

const ProblemSection = () => {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardsRef = useRef([])

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

  useGSAP(() => {
    // Animate header
    gsap.from(headerRef.current.children, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: headerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    // Animate stat cards with stagger
    cardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.7,
        delay: index * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })

      // Highlight animation for numbers
      const numbers = card.querySelectorAll('.stat-number')
      gsap.from(numbers, {
        scale: 1.3,
        color: '#ff6b35',
        duration: 0.5,
        delay: index * 0.15 + 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })
    })

  }, { scope: sectionRef })

  return (
    <section className="problem-section" ref={sectionRef}>
      <div className="problem-container">
        <div className="problem-content" ref={headerRef}>
          <h2 className="problem-title">{t('problem.title')}</h2>
          <p className="problem-description">{t('problem.description')}</p>

          <div className="problem-stats">
            {stats.map((stat, index) => (
              <div
                key={stat.key}
                className="stat-card"
                ref={el => cardsRef.current[index] = el}
              >
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
