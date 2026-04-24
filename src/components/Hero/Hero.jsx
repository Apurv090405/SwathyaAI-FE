import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import { Button } from '@/components/ui/button'
import './Hero.css'

const Hero = () => {
  const { t } = useTranslation()
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Set initial states
    gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
      opacity: 0,
      y: 60
    })

    // Animate in sequence
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.3
    })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.5')
      .to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.4')
      .to('.btn', {
        scale: 1.05,
        duration: 0.3,
        stagger: 0.1,
        yoyo: true,
        repeat: 1
      }, '-=0.2')

  }, { scope: heroRef })

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title" ref={titleRef}>{t('hero.title')}</h1>
          <p className="hero-subtitle" ref={subtitleRef}>{t('hero.subtitle')}</p>
          <div className="hero-cta" ref={ctaRef}>
            <Button asChild className="btn shadow-md">
              <a href="#get-started">{t('hero.cta1')}</a>
            </Button>
            <Button asChild variant="outline" className="btn bg-background/80 backdrop-blur-sm">
              <a href="#learn-more">{t('hero.cta2')}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

