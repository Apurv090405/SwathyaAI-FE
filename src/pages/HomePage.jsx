import React from 'react'
import Header from '../components/Header/Header'
import Hero from '../components/Hero/Hero'
import LogoBanner from '../components/LogoBanner/LogoBanner'
import ValueProposition from '../components/ValueProposition/ValueProposition'
import Features from '../components/Features/Features'
import ProblemSection from '../components/ProblemSection/ProblemSection'
import StatisticsSection from '../components/StatisticsSection/StatisticsSection'
import ImpactSection from '../components/ImpactSection/ImpactSection'
import CTASection from '../components/CTASection/CTASection'
import Footer from '../components/Footer/Footer'
import './HomePage.css'

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <main className="main-content">
        <Hero />
        <LogoBanner />
        <ValueProposition />
        <Features />
        <ProblemSection />
        <StatisticsSection />
        <ImpactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage

