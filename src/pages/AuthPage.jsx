import React, { useState, useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../utils/gsapConfig'
import './AuthPage.css'

const AuthPage = () => {
    // Check URL hash to determine initial mode
    const getInitialMode = () => {
        return window.location.hash === '#signup' ? false : true
    }

    const [isLogin, setIsLogin] = useState(getInitialMode)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)

    const containerRef = useRef(null)
    const formRef = useRef(null)

    // Update mode when hash changes
    useEffect(() => {
        const handleHashChange = () => {
            setIsLogin(window.location.hash !== '#signup')
        }
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    useGSAP(() => {
        // Animate the decorative elements
        gsap.fromTo('.auth-decoration',
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
        )

        // Animate the form card
        gsap.fromTo(formRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 }
        )
    }, { scope: containerRef })

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        // Redirect to dashboard after login/signup
        window.location.hash = 'dashboard'
    }

    const switchMode = (toSignup) => {
        gsap.to(formRef.current, {
            opacity: 0,
            x: toSignup ? -20 : 20,
            duration: 0.2,
            onComplete: () => {
                window.location.hash = toSignup ? 'signup' : 'signin'
                gsap.fromTo(formRef.current,
                    { opacity: 0, x: toSignup ? 20 : -20 },
                    { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
                )
            }
        })
    }

    const goHome = (e) => {
        e.preventDefault()
        window.location.hash = ''
    }

    return (
        <div className="auth-page" ref={containerRef}>
            {/* Back to Home Button */}
            <a href="#" className="back-home-btn" onClick={goHome}>
                ← Back to Home
            </a>

            {/* Decorative Background Elements */}
            <div className="auth-background">
                <div className="auth-decoration decoration-1"></div>
                <div className="auth-decoration decoration-2"></div>
                <div className="auth-decoration decoration-3"></div>
                <div className="auth-decoration decoration-4"></div>

                {/* Indian Pattern Overlay */}
                <div className="pattern-overlay"></div>
            </div>

            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="branding-content">
                        <div className="brand-logo">
                            <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="18" stroke="#FF6B35" strokeWidth="3" fill="none" />
                                <circle cx="20" cy="20" r="12" stroke="#FF6B35" strokeWidth="2" fill="none" />
                                <circle cx="20" cy="20" r="6" fill="#FF6B35" />
                            </svg>
                        </div>
                        <h1 className="brand-title">SwasthyaAI</h1>
                        <p className="brand-tagline">स्वस्थ भारत, सशक्त भारत</p>
                        <p className="brand-description">
                            India's first AI-powered voice health assistant.
                            Accessible healthcare for every Indian, in every language.
                        </p>

                        <div className="brand-features">
                            <div className="feature-item">
                                <span className="feature-icon">🎯</span>
                                <span>AI-Powered Health Triage</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🗣️</span>
                                <span>12+ Indian Languages</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📞</span>
                                <span>Works on Any Phone</span>
                            </div>
                        </div>

                        {/* Decorative Rangoli Pattern */}
                        <div className="rangoli-pattern">
                            <div className="rangoli-dot"></div>
                            <div className="rangoli-dot"></div>
                            <div className="rangoli-dot"></div>
                            <div className="rangoli-dot"></div>
                            <div className="rangoli-dot center"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-section" ref={formRef}>
                    <div className="auth-card">
                        <div className="auth-header">
                            <h2 className="auth-title">
                                {isLogin ? 'Welcome Back' : 'Join SwasthyaAI'}
                            </h2>
                            <p className="auth-subtitle">
                                {isLogin
                                    ? 'Sign in to access your health dashboard'
                                    : 'Create an account to start your health journey'}
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${isLogin ? 'active' : ''}`}
                                onClick={() => !isLogin && switchMode(false)}
                            >
                                Sign In
                            </button>
                            <button
                                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => isLogin && switchMode(true)}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">👤</span>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">📱</span>
                                        <div className="phone-input">
                                            <span className="country-code">+91</span>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="10-digit mobile number"
                                                className="form-input phone"
                                                pattern="[0-9]{10}"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        className="form-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm your password"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {isLogin && (
                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input type="checkbox" className="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#forgot" className="forgot-link">Forgot Password?</a>
                                </div>
                            )}

                            {!isLogin && (
                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input type="checkbox" className="checkbox" required />
                                        <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></span>
                                    </label>
                                </div>
                            )}

                            <button type="submit" className="auth-submit-btn">
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <span className="btn-arrow">→</span>
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="social-auth">
                            <button type="button" className="social-btn google">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button type="button" className="social-btn phone">
                                📞 Phone OTP
                            </button>
                        </div>

                        <p className="auth-footer-text">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button type="button" className="switch-mode-btn" onClick={() => switchMode(!isLogin)}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage
