import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import './StatisticsSection.css'

const StatisticsSection = () => {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const statsRef = useRef([])

  const statistics = [
    {
      key: 'totalCalls',
      label: 'CALLS',
      value: '2.3M+',
      numericValue: 2.3,
      suffix: 'M+'
    },
    {
      key: 'criticalCases',
      label: 'CRITICAL CASES',
      value: '112K+',
      numericValue: 112,
      suffix: 'K+'
    },
    {
      key: 'activeDoctors',
      label: 'DOCTORS',
      value: '11.8K',
      numericValue: 11.8,
      suffix: 'K'
    }
  ]

  useGSAP(() => {
    // Animate stat items with stagger
    statsRef.current.forEach((stat, index) => {
      const valueElement = stat.querySelector('.stat-value')
      const statData = statistics[index]

      // Initial state
      gsap.set(stat, { opacity: 0, y: 50, scale: 0.9 })

      // Create animation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stat,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })

      // Animate in
      tl.to(stat, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay: index * 0.2,
        ease: 'back.out(1.7)'
      })

      // Counter animation
      const countObj = { value: 0 }
      tl.to(countObj, {
        value: statData.numericValue,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          const formatted = statData.numericValue >= 100
            ? Math.floor(countObj.value)
            : countObj.value.toFixed(1)
          valueElement.textContent = formatted + statData.suffix
        }
      }, '<+=0.3')
    })

  }, { scope: sectionRef })

  return (
    <section className="statistics-section" ref={sectionRef}>
      <div className="statistics-container">
        <div className="statistics-grid">
          {statistics.map((stat, index) => (
            <div
              key={stat.key}
              className="stat-item"
              ref={el => statsRef.current[index] = el}
            >
              <div className="stat-label">{t(`statistics.${stat.key}.label`)}</div>
              <div className="stat-value">0</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatisticsSection
