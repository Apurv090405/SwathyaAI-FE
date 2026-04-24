import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../utils/gsapConfig'
import { Button } from '@/components/ui/button'
import './ImpactSection.css'

const ImpactSection = () => {
  const { t } = useTranslation()
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' or 'yearly'
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardsRef = useRef([])
  const toggleRef = useRef(null)

  const plans = [
    {
      key: 'patients',
      title: 'PATIENTS',
      monthlyPrice: 10,
      priceUnit: 'per call',
      bonus: null,
      features: [
        { label: 'Free Credits', value: 'None' },
        { label: 'Rate Limit', value: '60 calls/min' },
        { label: 'Support', value: 'Community' },
        { label: 'Ideal For', value: 'Individual patients, health queries' }
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      key: 'doctors',
      title: 'DOCTORS',
      monthlyPrice: 20,
      priceUnit: 'per call',
      bonus: '₹2 Bonus Credits',
      features: [
        { label: 'Total Credits', value: '22 calls' },
        { label: 'Rate Limit', value: '200 calls/min' },
        { label: 'Support', value: 'Email support' },
        { label: 'Ideal For', value: 'Clinics, teleconsultation' }
      ],
      buttonText: 'Start with Doctors',
      popular: false
    },
    {
      key: 'communities',
      title: 'COMMUNITIES',
      monthlyPrice: 8,
      priceUnit: 'per call',
      bonus: '₹0.80 Bonus Credits',
      features: [
        { label: 'Total Credits', value: '8.80 calls' },
        { label: 'Rate Limit', value: '1,000 calls/min' },
        { label: 'Support', value: 'Slack + Solutions Engineer' },
        { label: 'Ideal For', value: 'PHCs, large-scale deployments' }
      ],
      buttonText: 'Start Scaling',
      popular: true
    }
  ]

  const calculateYearlyPrice = (monthlyPrice) => {
    const discounted = monthlyPrice * 0.9 // 10% off per call
    return discounted.toFixed(2)
  }

  const handleBillingToggle = (cycle) => {
    setBillingCycle(cycle)
    // Animate price change
    gsap.from('.price', {
      scale: 1.2,
      duration: 0.3,
      ease: 'back.out(1.7)'
    })
  }

  useGSAP(() => {
    // Animate header
    gsap.from(headerRef.current.children, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: headerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    // Animate toggle
    gsap.from(toggleRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: toggleRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    })

    // Animate pricing cards
    cardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 80,
        rotateX: 15,
        scale: 0.9,
        duration: 0.8,
        delay: index * 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })

      // Hover animation
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out'
        })
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
      })
    })

    // Pulse animation for popular badge
    gsap.to('.popular-badge', {
      scale: 1.05,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })

  }, { scope: sectionRef })

  return (
    <section className="impact-section" ref={sectionRef}>
      <div className="impact-container">
        <div className="impact-header" ref={headerRef}>
          <h2 className="impact-title">{t('impact.title')}</h2>
          <p className="impact-subtitle">{t('impact.subtitle')}</p>
        </div>

        <div className="pricing-toggle" ref={toggleRef}>
          <Button
            type="button"
            variant="ghost"
            className={`toggle-button h-10 px-4 ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => handleBillingToggle('monthly')}
          >
            Monthly
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`toggle-button h-10 px-4 ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => handleBillingToggle('yearly')}
          >
            Yearly <span className="discount-badge">10% OFF</span>
          </Button>
        </div>

        <div className="impact-grid pricing-grid">
          {plans.map((plan, index) => {
            const displayPrice = billingCycle === 'yearly'
              ? `₹${calculateYearlyPrice(plan.monthlyPrice)}`
              : `₹${plan.monthlyPrice}`
            const displayUnit = plan.priceUnit // Always show "per call"
            return (
              <div
                key={plan.key}
                className={`impact-card pricing-card ${plan.popular ? 'popular' : ''}`}
                ref={el => cardsRef.current[index] = el}
              >
                {plan.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <h3 className="pricing-plan-title">{plan.title}</h3>
                <div className="pricing-amount">
                  <span className="price">{displayPrice}</span>
                  <span className="price-unit">{displayUnit}</span>
                </div>
                {plan.bonus && (
                  <div className="bonus-badge">
                    {plan.bonus}
                  </div>
                )}
                <div className="pricing-features">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="pricing-feature">
                      <span className="feature-label">{feature.label}:</span>
                      <span className="feature-value">{feature.value}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="pricing-button h-10 w-full">
                  <a href="/signup">{plan.buttonText}</a>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ImpactSection
