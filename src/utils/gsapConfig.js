// GSAP Configuration and Utilities
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Default animation settings
export const defaultDuration = 0.8
export const defaultEase = 'power3.out'

// Common animation configurations
export const fadeInUp = {
  opacity: 0,
  y: 50,
  duration: defaultDuration,
  ease: defaultEase
}

export const fadeInDown = {
  opacity: 0,
  y: -50,
  duration: defaultDuration,
  ease: defaultEase
}

export const fadeInLeft = {
  opacity: 0,
  x: -100,
  duration: defaultDuration,
  ease: defaultEase
}

export const fadeInRight = {
  opacity: 0,
  x: 100,
  duration: defaultDuration,
  ease: defaultEase
}

export const scaleIn = {
  opacity: 0,
  scale: 0.8,
  duration: defaultDuration,
  ease: 'back.out(1.7)'
}

// Stagger settings
export const staggerSettings = {
  fast: 0.1,
  normal: 0.15,
  slow: 0.25
}

// ScrollTrigger defaults
export const scrollTriggerDefaults = {
  start: 'top 80%',
  end: 'bottom 20%',
  toggleActions: 'play none none reverse'
}

// Counter animation utility
export const animateCounter = (element, target, duration = 2, suffix = '') => {
  const obj = { value: 0 }
  
  // Parse target value (handles formats like "2.3M+", "112K+", "11.8K")
  let numericTarget = 0
  let displaySuffix = suffix
  
  if (typeof target === 'string') {
    const match = target.match(/([0-9.]+)([KMB]?\+?)/)
    if (match) {
      numericTarget = parseFloat(match[1])
      displaySuffix = match[2] || suffix
    }
  } else {
    numericTarget = target
  }
  
  return gsap.to(obj, {
    value: numericTarget,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      const formatted = numericTarget >= 10 
        ? Math.floor(obj.value).toLocaleString() 
        : obj.value.toFixed(1)
      element.textContent = formatted + displaySuffix
    }
  })
}

// Export GSAP and ScrollTrigger for use in components
export { gsap, ScrollTrigger }
