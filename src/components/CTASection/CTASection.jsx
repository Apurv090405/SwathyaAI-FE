import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import { Button } from '@/components/ui/button'
import './CTASection.css'

const CTASection = () => {
  const { t } = useTranslation()
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const buttonRef = useRef(null)

  useGSAP(() => {
    // Fade in content
    gsap.from(contentRef.current.children, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    })

    // Pulsing glow effect on button
    gsap.to(buttonRef.current, {
      boxShadow: '0 0 30px rgba(255, 107, 53, 0.6)',
      scale: 1.02,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })

    // Button hover enhancement
    buttonRef.current.addEventListener('mouseenter', () => {
      gsap.to(buttonRef.current, {
        scale: 1.08,
        duration: 0.3,
        ease: 'power2.out'
      })
    })

    buttonRef.current.addEventListener('mouseleave', () => {
      gsap.to(buttonRef.current, {
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      })
    })

  }, { scope: sectionRef })

  return (
    <section className="cta-section" ref={sectionRef}>
      <div className="cta-container">
        <div className="cta-content" ref={contentRef}>
          <h2 className="cta-title">{t('cta.title')}</h2>
          <p className="cta-subtitle">{t('cta.subtitle')}</p>
          <Button asChild ref={buttonRef} className="btn btn-cta h-11 px-8 text-base shadow-lg">
            <a href="#get-started">{t('cta.button')}</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CTASection

