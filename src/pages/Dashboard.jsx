import React, { useState, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../utils/gsapConfig'
import './Dashboard.css'

const Dashboard = () => {
    const [activeNav, setActiveNav] = useState('overview')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const dashboardRef = useRef(null)

    const user = {
        name: 'Apurv Chaturvedi',
        email: 'apurv.c@codiste.com',
        plan: 'Pro Plan'
    }

    const metrics = [
        { id: 'calls', label: 'Total Calls', value: '2,847', change: '+12.5%', trend: 'up' },
        { id: 'duration', label: 'Avg Duration', value: '4:32', change: '+8.2%', trend: 'up' },
        { id: 'success', label: 'Success Rate', value: '94.7%', change: '+2.1%', trend: 'up' },
        { id: 'languages', label: 'Languages', value: '8', change: '+3', trend: 'up' }
    ]

    const recentCalls = [
        { id: 1, caller: 'Ramesh Kumar', language: 'Hindi', duration: '5:23', status: 'completed', time: '2 min ago' },
        { id: 2, caller: 'Priya Sharma', language: 'Tamil', duration: '3:45', status: 'completed', time: '15 min ago' },
        { id: 3, caller: 'Vikram Singh', language: 'Punjabi', duration: '7:12', status: 'completed', time: '32 min ago' },
        { id: 4, caller: 'Lakshmi Iyer', language: 'Telugu', duration: '4:56', status: 'missed', time: '1 hour ago' },
    ]

    const navItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'calls', label: 'Call History' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'assistants', label: 'AI Assistants' },
        { id: 'languages', label: 'Languages' },
    ]

    const systemItems = [
        { id: 'billing', label: 'Billing' },
        { id: 'settings', label: 'Settings' },
    ]

    useGSAP(() => {
        gsap.fromTo('.metric-card',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
        )
        gsap.fromTo('.dashboard-panel',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
        )
    }, { scope: dashboardRef })

    return (
        <div className="dashboard" ref={dashboardRef}>
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="16" stroke="#FF6B35" strokeWidth="2.5" fill="none" />
                            <circle cx="20" cy="20" r="10" stroke="#FF6B35" strokeWidth="1.5" fill="none" />
                            <circle cx="20" cy="20" r="5" fill="#FF6B35" />
                        </svg>
                        {!sidebarCollapsed && <span className="logo-text">SwasthyaAI</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        {!sidebarCollapsed && <span className="nav-section-label">Menu</span>}
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                {!sidebarCollapsed && item.label}
                            </button>
                        ))}
                    </div>

                    <div className="nav-section">
                        {!sidebarCollapsed && <span className="nav-section-label">System</span>}
                        {systemItems.map(item => (
                            <button
                                key={item.id}
                                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                {!sidebarCollapsed && item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">{user.name.charAt(0)}</div>
                        {!sidebarCollapsed && (
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="page-subtitle">Welcome back, {user.name.split(' ')[0]}</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={() => window.location.hash = ''}>
                            Logout
                        </button>
                    </div>
                </header>

                {/* Metrics */}
                <section className="metrics-row">
                    {metrics.map(metric => (
                        <div key={metric.id} className="metric-card">
                            <span className="metric-label">{metric.label}</span>
                            <div className="metric-value-row">
                                <span className="metric-value">{metric.value}</span>
                                <span className={`metric-change ${metric.trend}`}>{metric.change}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Panels */}
                <div className="panels-grid">
                    {/* Chart */}
                    <div className="dashboard-panel panel-chart">
                        <div className="panel-header">
                            <h3>Call Analytics</h3>
                            <select className="select-small">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                            </select>
                        </div>
                        <div className="chart-area">
                            <div className="chart-bars">
                                {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                                    <div key={i} className="bar-col">
                                        <div className="bar" style={{ height: `${h}%` }}></div>
                                        <span className="bar-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="dashboard-panel panel-languages">
                        <div className="panel-header">
                            <h3>Language Usage</h3>
                        </div>
                        <div className="language-list">
                            {[
                                { lang: 'Hindi', percent: 45 },
                                { lang: 'Tamil', percent: 20 },
                                { lang: 'Telugu', percent: 15 },
                                { lang: 'Bengali', percent: 12 },
                                { lang: 'Others', percent: 8 },
                            ].map((item, i) => (
                                <div key={i} className="language-row">
                                    <div className="lang-info">
                                        <span className="lang-name">{item.lang}</span>
                                        <span className="lang-percent">{item.percent}%</span>
                                    </div>
                                    <div className="lang-bar">
                                        <div className="lang-fill" style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Calls */}
                    <div className="dashboard-panel panel-calls">
                        <div className="panel-header">
                            <h3>Recent Calls</h3>
                            <button className="link-btn">View all</button>
                        </div>
                        <div className="calls-list">
                            {recentCalls.map(call => (
                                <div key={call.id} className="call-row">
                                    <div className="call-avatar">{call.caller.charAt(0)}</div>
                                    <div className="call-details">
                                        <span className="call-name">{call.caller}</span>
                                        <span className="call-meta">{call.language} · {call.duration}</span>
                                    </div>
                                    <div className="call-right">
                                        <span className={`status-dot ${call.status}`}></span>
                                        <span className="call-time">{call.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dashboard-panel panel-actions">
                        <div className="panel-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div className="actions-grid">
                            <button className="action-card">New Agent</button>
                            <button className="action-card">Add Knowledge</button>
                            <button className="action-card">View Reports</button>
                            <button className="action-card">Settings</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
