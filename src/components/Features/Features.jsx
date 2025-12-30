import React, { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import './Features.css'

const Features = () => {
  const { t } = useTranslation()
  const videoRefs = useRef([])
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardsRef = useRef([])

  const features = [
    {
      key: 'voiceFirst',
      title: 'Voice-First Interface',
      description: 'Access via any phone - no smartphone or internet required. Toll-free number works on basic feature phones.',
      delay: 0
    },
    {
      key: 'multilingual',
      title: '12+ Languages',
      description: 'Speak in your language. Automatic language detection supports Hindi, Gujarati, Tamil, Marathi, and more.',
      delay: 500
    },
    {
      key: 'aiTriage',
      title: 'AI-Powered Triage',
      description: 'Intelligent risk assessment guides you to the right care - self-care, PHC referral, or immediate doctor connection.',
      delay: 1000
    },
    {
      key: 'ruralFocus',
      title: 'Built for Rural India',
      description: 'Designed specifically to address the healthcare crisis affecting 65% of India\'s population in rural areas.',
      delay: 1500
    }
  ]

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        const delay = features[index].delay
        setTimeout(() => {
          video.play().catch(err => {
            console.log('Video autoplay prevented:', err)
          })
        }, delay)
      }
    })
  }, [])

  useGSAP(() => {
    // Animate header
    gsap.from(headerRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      scrollTrigger: {
        trigger: headerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    })

    // Animate cards with stagger
    cardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 80,
        scale: 0.95,
        duration: 0.8,
        delay: index * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })

      // Add hover animation
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.02,
          y: -5,
          duration: 0.3,
          ease: 'power2.out'
        })
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
      })
    })

  }, { scope: sectionRef })

  return (
    <section className="features" id="products" ref={sectionRef}>
      <div className="features-container">
        <div className="features-header" ref={headerRef}>
          <h2 className="features-title">{t('features.title')}</h2>
          <p className="features-subtitle">{t('features.subtitle')}</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const rotations = [
              { rotate: 0, scaleX: 1, scaleY: 1 },      // 1st: 0° normal
              { rotate: 90, scaleX: -1, scaleY: 1 },   // 2nd: 90° rotated, flipped left/right
              { rotate: 180, scaleX: 1, scaleY: -1 },  // 3rd: 180° rotated, flipped up/down
              { rotate: 360, scaleX: -1, scaleY: 1 }   // 4th: 360° (0°), flipped left/right
            ]
            const transform = rotations[index]
            return (
              <div
                key={feature.key}
                className="feature-card"
                ref={el => cardsRef.current[index] = el}
              >
                <div className="feature-video-container">
                  <video
                    ref={el => videoRefs.current[index] = el}
                    src="/videos/whyweare.mp4"
                    loop
                    muted
                    playsInline
                    className="feature-video"
                    style={{
                      transform: `rotate(${transform.rotate}deg) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="feature-content">
                  <h3 className="feature-card-title">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="feature-card-description">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
