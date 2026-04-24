import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import { Button } from '@/components/ui/button'
import './ValueProposition.css'

const ValueProposition = () => {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const textRef = useRef(null)
  const patternRef = useRef(null)

  useGSAP(() => {
    // Image slides in from left with scale
    gsap.from(imageRef.current, {
      opacity: 0,
      x: -100,
      scale: 0.9,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    })

    // Text slides in from right
    gsap.from(textRef.current, {
      opacity: 0,
      x: 100,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    })

    // Pattern items animate in with stagger
    gsap.from('.pattern-item', {
      opacity: 0,
      scale: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: patternRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    })

    // Parallax effect on image
    gsap.to(imageRef.current, {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    })

  }, { scope: sectionRef })

  return (
    <section className="value-prop" ref={sectionRef}>
      <div className="value-prop-container">
        <div className="value-prop-content">
          <div className="value-prop-image" ref={imageRef}>
            <img
              src="/images/ImmHealthcAccess.jpg"
              alt="India Healthcare Access Map"
              className="healthcare-map-image"
            />
          </div>

          <div className="value-prop-text" ref={textRef}>
            <h2 className="value-prop-title">
              {t('valueProp.title')}
            </h2>
            <p className="value-prop-subtitle">
              {t('valueProp.subtitle')}
            </p>
            <Button asChild className="value-prop-button h-10 px-6">
              <a href="#learn-more">{t('valueProp.button')}</a>
            </Button>
            <div className="value-prop-pattern" ref={patternRef}>
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
