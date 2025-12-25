import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ImpactSection.css'

const ImpactSection = () => {
  const { t } = useTranslation()
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' or 'yearly'

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

  return (
    <section className="impact-section">
      <div className="impact-container">
        <div className="impact-header">
          <h2 className="impact-title">{t('impact.title')}</h2>
          <p className="impact-subtitle">{t('impact.subtitle')}</p>
        </div>

        <div className="pricing-toggle">
          <button
            className={`toggle-button ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`toggle-button ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly <span className="discount-badge">10% OFF</span>
          </button>
        </div>
        
        <div className="impact-grid pricing-grid">
          {plans.map((plan) => {
            const displayPrice = billingCycle === 'yearly' 
              ? `₹${calculateYearlyPrice(plan.monthlyPrice)}` 
              : `₹${plan.monthlyPrice}`
            const displayUnit = plan.priceUnit // Always show "per call"
            return (
              <div key={plan.key} className={`impact-card pricing-card ${plan.popular ? 'popular' : ''}`}>
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
                <a href="#signup" className="pricing-button">
                  {plan.buttonText}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ImpactSection
