import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase } from './supabase'
import type { RouteInfo } from './MapPlanner'
import { StaticFallbackMap, ACTIVITY_EMOJIS, OnboardingMapVisual } from './MapPlanner'

// Lazy-load heavy map components
const MapPlanner = lazy(() => import('./MapPlanner').then(m => ({ default: m.MapPlanner })))
const ActiveJourneyMap = lazy(() => import('./MapPlanner').then(m => ({ default: m.ActiveJourneyMap })))

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | 'onboarding' | 'home' | 'create-journey' | 'safety-buddy'
  | 'journey-review' | 'active-journey' | 'arrival'
  | 'buddy-webview' | 'buddy-alert' | 'safety-circle'
  | 'history' | 'profile' | 'settings'
  | 'account-setup' | 'add-contact' | 'data-privacy' | 'help-support'
  | 'your-journeys' | 'tracking' | 'buddy-alert-tracking' | 'about'
  | 'subscription-plan' | 'payment-method' | 'subscription-settings'

type NavTab = 'home' | 'tracking' | 'circle' | 'activity' | 'profile'

type JState = 'normal' | 'unusual-stationary' | 'unusual-offroute' | 'concern-fall'

interface Contact { name: string; phone: string; role: string }

interface CompletedJourney {
  id: number
  name: string
  activityType: string
  distanceKm: number
  durationMin: number
  completedAt: Date
  status: 'normal' | 'stopped' | 'offroute' | 'fall'
}

// ─── Icon library ─────────────────────────────────────────────────────────────
const I = {
  home:     <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  map:      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  activity: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  user:     <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  chevron:  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  plus:     <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  shield:   <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  phone:    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  lock:     <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  heart:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  back:     <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  bell:     <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  share:    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  message:  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  location: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  warning:  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md', active = true, online = false }: {
  name: string; size?: 'sm' | 'md' | 'lg'; active?: boolean; online?: boolean
}) {
  const letter = name.trim()[0].toUpperCase()
  const hue = (name.charCodeAt(0) * 37 + name.charCodeAt(name.length - 1) * 19) % 360
  const dim = size === 'sm' ? 32 : size === 'lg' ? 56 : 40
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 22 : 16
  const dotSize = size === 'sm' ? 8 : 10
  const ringW = size === 'sm' ? 1.5 : 2
  const ringGrad = `conic-gradient(from 200deg, #F9DDD1, hsl(${hue}, 60%, 80%), #C8DDFB, #F9DDD1)`
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div style={{ width: dim + ringW * 2 + 2, height: dim + ringW * 2 + 2, borderRadius: '50%', background: ringGrad, padding: ringW + 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: dim, height: dim, borderRadius: '50%', background: 'rgba(255,255,255,0.48)', backdropFilter: 'blur(14px) saturate(160%)', WebkitBackdropFilter: 'blur(14px) saturate(160%)', border: '1px solid rgba(255,255,255,0.75)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80), inset 0 -1px 0 rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: dim * 0.15, width: dim * 0.70, height: dim * 0.38, background: 'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '0 0 50% 50%', pointerEvents: 'none' }}/>
          <span style={{ fontFamily: '"DM Serif Display", serif', fontSize, fontWeight: 400, color: '#2A1F18', lineHeight: 1, letterSpacing: '-0.01em', position: 'relative', zIndex: 1 }}>{letter}</span>
        </div>
      </div>
      {(active || online) && (
        <span style={{ position: 'absolute', bottom: 0, right: 0, width: dotSize, height: dotSize, borderRadius: '50%', background: 'linear-gradient(135deg, #5DBB7A, #3A9A5C)', border: '2px solid rgba(255,255,255,0.90)', boxShadow: '0 0 6px rgba(74,124,89,0.50)' }}/>
      )}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ state, buddyName, label: labelProp }: { state: 'normal' | 'unusual' | 'concern'; buddyName?: string; label?: string }) {
  const cfg = {
    normal:  { cls: 'glass-green', dot: '#3D7A50', text: '#1E4D31', label: 'Everything looks normal' },
    unusual: { cls: 'glass-amber', dot: '#C47A25', text: '#6A3800', label: `${buddyName ?? 'Your buddy'} has been notified` },
    concern: { cls: 'glass-red',   dot: '#C43A3A', text: '#7A1A1A', label: `${buddyName ?? 'Your buddy'} has been notified` },
  }
  const c = cfg[state]
  const displayLabel = labelProp ?? c.label
  return (
    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${c.cls}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${state === 'normal' ? 'animate-pulse' : ''}`} style={{ background: c.dot }}/>
      <span className="text-sm font-medium" style={{ color: c.text }}>{displayLabel}</span>
    </span>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ position: 'relative', width: 48, height: 26, borderRadius: 999, transition: 'all 0.25s', background: on ? 'linear-gradient(135deg, rgba(70,130,88,0.88), rgba(45,95,60,0.94))' : 'rgba(210,205,215,0.50)', border: '1px solid rgba(255,255,255,0.42)', boxShadow: on ? '0 2px 12px rgba(50,100,65,0.28), inset 0 1px 0 rgba(255,255,255,0.22)' : 'inset 0 1px 0 rgba(255,255,255,0.48)', cursor: 'pointer' }}>
      <span style={{ position: 'absolute', top: 2, left: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.14)', transition: 'transform 0.25s', transform: on ? 'translateX(22px)' : 'translateX(0)' }}/>
    </button>
  )
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
function BottomNav({ active, onNav }: { active: NavTab; onNav: (t: NavTab) => void }) {
  const tabs: { key: NavTab; icon: keyof typeof I; label: string }[] = [
    { key: 'home',     icon: 'home',     label: 'Home' },
    { key: 'tracking', icon: 'map',      label: 'Tracking' },
    { key: 'circle',   icon: 'users',    label: 'Circle' },
    { key: 'activity', icon: 'activity', label: 'Activity' },
    { key: 'profile',  icon: 'user',     label: 'Profile' },
  ]
  return (
    <div className="glass-3 flex items-center border-t border-white/35 px-2 pb-2 pt-2">
      {tabs.map(t => {
        const isActive = active === t.key
        return (
          <button key={t.key} onClick={() => onNav(t.key)} className="flex-1 flex flex-col items-center gap-0.5 py-1 transition-all">
            <div style={{ width: 22, height: 22, color: isActive ? '#1A3A28' : '#3A2E26', opacity: isActive ? 1 : 0.65 }}>{I[t.icon]}</div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? '#1A3A28' : '#3A2E26', opacity: isActive ? 1 : 0.65, letterSpacing: isActive ? '-0.01em' : 0 }}>{t.label}</span>
            {isActive && <span style={{ width: 16, height: 2.5, borderRadius: 999, marginTop: 1, background: 'linear-gradient(90deg, #F9DDD1, #C8DDFB)' }}/>}
          </button>
        )
      })}
    </div>
  )
}

// ─── Screen header ────────────────────────────────────────────────────────────
function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="px-5 pt-4 pb-2">
      {onBack && (
        <button onClick={onBack} className="mb-3 flex items-center gap-2 text-[#2A1F18]" style={{ opacity: 0.7 }}>
          <div style={{ width: 16, height: 16 }}>{I.back}</div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Back</span>
        </button>
      )}
      <h1 className="font-display text-2xl text-[#2A1F18] leading-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[#7A6860] leading-relaxed">{subtitle}</p>}
    </div>
  )
}

// ─── Glass card ───────────────────────────────────────────────────────────────
function GCard({ children, className = '', tint = 'none', onClick }: {
  children: React.ReactNode; className?: string
  tint?: 'none' | 'pink' | 'blue' | 'green' | 'amber' | 'red'
  onClick?: () => void
}) {
  const tintCls = { none: 'glass-1', pink: 'glass-pink', blue: 'glass-blue', green: 'glass-green', amber: 'glass-amber', red: 'glass-red' }[tint]
  return (
    <div className={`${tintCls} rounded-2xl ${className}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>{children}</div>
  )
}

// ─── Map loading spinner ──────────────────────────────────────────────────────
function MapLoader() {
  return (
    <div className="h-full flex items-center justify-center glass-1">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-[#4A7C59] border-t-transparent rounded-full animate-spin mx-auto mb-2"/>
        <p className="text-xs text-[#7A6860]">Loading map…</p>
      </div>
    </div>
  )
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete, onSkip, hasAccount }: { onComplete: () => void; onSkip: () => void; hasAccount: boolean }) {
  const [step, setStep] = useState(0)

  const slides = [
    {
      visual: (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(200,221,251,0.22)', border: '1px solid rgba(255,255,255,0.40)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 16px rgba(249,221,209,0.10), inset 0 1px 0 rgba(255,255,255,0.50)' }}>
            <div style={{ width: 36, height: 36, color: '#3D6B4F' }}>{I.shield}</div>
          </div>
          <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#5DBB7A,#3A9A5C)', border: '2px solid rgba(255,255,255,0.80)', boxShadow: '0 0 8px rgba(74,124,89,0.40)' }} className="animate-pulse"/>
        </div>
      ),
      h: 'Go anywhere.\nFeel connected.',
      sub: 'SafeJourney quietly watches your journey and lets someone you trust know if something changes.',
      cta: 'Get Started',
      hideSkip: false,
      final: false,
    },
    {
      visual: <OnboardingMapVisual/>,
      h: 'Plan your\njourney',
      sub: 'Draw your route on a real map. The app knows what your normal looks like.',
      cta: 'Continue',
      hideSkip: true,
      final: false,
    },
    {
      visual: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {[{ name: 'You', you: true }, { name: 'Buddy', you: false }].map((p) => (
            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Avatar name={p.name} size="lg" active={p.you} online={p.you}/>
              <span style={{ fontSize: 11, color: 'rgba(42,31,24,0.55)' }}>{p.you ? 'You' : p.name}</span>
            </div>
          ))}
        </div>
      ),
      h: 'Choose your\nsafety buddy',
      sub: "Your buddy doesn't need to watch your location. We'll notify them only when something unusual happens.",
      cta: 'Continue',
      hideSkip: true,
      final: false,
    },
    {
      visual: (
        <GCard tint="blue" className="p-5 flex items-center gap-4">
          <div style={{ width: 36, height: 36, color: '#1A3A5A' }}>{I.lock}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1A3A5A' }}>Location private by default</p>
            <p style={{ fontSize: 11, color: '#4A6A8A', marginTop: 2 }}>Shared only during active journeys</p>
          </div>
        </GCard>
      ),
      h: 'Privacy\ncomes first',
      sub: 'Your location is shared only during an active journey and stops automatically when it ends.',
      cta: 'Create my first journey',
      hideSkip: true,
      final: true,
    },
  ]

  const s = slides[step]
  const handleFinal = () => {
    if (hasAccount) {
      onSkip()
    } else {
      onComplete()
    }
  }
  const handleSkip = () => {
    if (hasAccount) {
      onSkip()
    } else {
      onComplete()
    }
  }
  return (
    <div className="flex flex-col min-h-full app-bg" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,221,209,0.55) 0%, transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: 120, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,221,251,0.45) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 64, paddingBottom: 16, position: 'relative', zIndex: 1 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} style={{ height: 5, borderRadius: 999, transition: 'all 0.3s', width: i === step ? 28 : 5, background: i === step ? '#3D6B4F' : 'rgba(42,31,24,0.20)' }}/>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', gap: 40, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.visual}</div>
        <div style={{ textAlign: 'center' }}>
          <h1 className="font-display" style={{ fontSize: 40, lineHeight: 1.15, color: '#2A1F18', whiteSpace: 'pre-line', marginBottom: 16 }}>{s.h}</h1>
          <p style={{ fontSize: 15, color: '#5A4A40', lineHeight: 1.6, maxWidth: 280 }}>{s.sub}</p>
        </div>
      </div>

      <div style={{ padding: '16px 24px 60px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}>
        <button className="btn-blue" onClick={() => s.final ? handleFinal() : setStep(step + 1)}>{s.cta}</button>
        {!s.final && !s.hideSkip && (
          <button onClick={handleSkip} style={{ padding: '10px', fontSize: 13, color: 'rgba(42,31,24,0.42)', fontFamily: 'Outfit,sans-serif', cursor: 'pointer', background: 'none', border: 'none' }}>Skip</button>
        )}
      </div>
    </div>
  )
}

// ─── Account Setup ────────────────────────────────────────────────────────────
function AccountSetup({ onConfirm, onDataPrivacy, initialValues, onValuesChange }: {
  onConfirm: (name: string, email: string, phone: string, password: string) => void
  onDataPrivacy: () => void
  initialValues?: { name: string; email: string; phone: string }
  onValuesChange?: (v: { name: string; email: string; phone: string }) => void
}) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [email, setEmail] = useState(initialValues?.email ?? '')
  const [phone, setPhone] = useState(initialValues?.phone ?? '')
  const [password, setPassword] = useState('')

  const notify = (n: string, e: string, p: string) => onValuesChange?.({ name: n, email: e, phone: p })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 16, fontSize: 14, fontFamily: 'Outfit,sans-serif', color: '#2A1F18',
    background: 'rgba(255,255,255,0.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.62)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)',
    outline: 'none',
  }

  return (
    <div className="flex flex-col min-h-full app-bg" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,221,209,0.50) 0%, transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: 180, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,221,251,0.42) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 24px 24px', gap: 24, position: 'relative', zIndex: 1, overflowY: 'auto' }} className="no-scrollbar">
        <div>
          <h1 className="font-display" style={{ fontSize: 36, color: '#2A1F18', lineHeight: 1.15, marginBottom: 8 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: '#5A4A40', lineHeight: 1.6 }}>Your information helps personalise your SafeJourney experience.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Name</p>
            <input style={inputStyle} type="text" placeholder="Your name" value={name} onChange={e => { setName(e.target.value); notify(e.target.value, email, phone) }}/>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email</p>
            <input style={inputStyle} type="email" placeholder="your@email.com" value={email} onChange={e => { setEmail(e.target.value); notify(name, e.target.value, phone) }}/>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Phone number</p>
            <input style={inputStyle} type="tel" placeholder="+1 555 000 0000" value={phone} onChange={e => { setPhone(e.target.value); notify(name, email, e.target.value) }}/>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Password</p>
            <input
              style={inputStyle}
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

        <GCard tint="blue" className="p-4 flex items-start gap-3">
          <div style={{ width: 16, height: 16, color: '#1A4A7A', flexShrink: 0, marginTop: 1 }}>{I.lock}</div>
          <div>
            <p style={{ fontSize: 13, color: '#1A3A6A', lineHeight: 1.55 }}>
              By confirming, you agree to how we use your data.{' '}
              <button onClick={onDataPrivacy} style={{ color: '#1A4A7A', fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: 13, textDecoration: 'underline' }}>Data & Privacy</button>
            </p>
          </div>
        </GCard>
      </div>

      <div style={{ padding: '12px 24px 48px', position: 'relative', zIndex: 1 }}>
        <button
        className="btn-blue"
        disabled={!name.trim() || !email.trim() || !password}
        onClick={() => onConfirm(name.trim(), email.trim(), phone.trim(), password)}
      >
        Confirm
      </button>
      </div>
    </div>
  )
}

// ─── Add Trusted Contact ──────────────────────────────────────────────────────
function AddTrustedContact({ onConfirm, onBack, initialData, title = 'Add trusted contact' }: {
  onConfirm: (c: Contact) => void
  onBack: () => void
  initialData?: Contact
  title?: string
}) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [role, setRole] = useState(initialData?.role ?? '')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 16, fontSize: 14, fontFamily: 'Outfit,sans-serif', color: '#2A1F18',
    background: 'rgba(255,255,255,0.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.62)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title={title} subtitle="They'll be notified when you start a journey and if something changes." onBack={onBack}/>
      <div style={{ flex: 1, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }} className="no-scrollbar">
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Name</p>
          <input style={inputStyle} type="text" placeholder="Contact name" value={name} onChange={e => setName(e.target.value)}/>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Phone number</p>
          <input style={inputStyle} type="tel" placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)}/>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Relationship</p>
          <input style={inputStyle} type="text" placeholder="e.g. Friend, Partner, Family" value={role} onChange={e => setRole(e.target.value)}/>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {['Friend', 'Partner', 'Family', 'Parent'].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{ padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'all 0.15s', ...(role === r ? { background: 'rgba(200,221,251,0.60)', color: '#0A1A3A', border: '1px solid rgba(200,221,251,0.65)', backdropFilter: 'blur(14px)' } : { background: 'rgba(255,255,255,0.30)', color: '#6A5848', border: '1px solid rgba(255,255,255,0.48)', backdropFilter: 'blur(12px)' }) }}>{r}</button>
            ))}
          </div>
        </div>
        <GCard tint="blue" className="p-4 flex gap-3">
          <div style={{ width: 14, height: 14, color: '#1A4A7A', flexShrink: 0, marginTop: 2 }}>{I.lock}</div>
          <p style={{ fontSize: 12, color: '#2A5A9A', lineHeight: 1.55 }}>This person only sees your location during an active journey you share with them.</p>
        </GCard>
      </div>
      <div style={{ padding: '12px 16px 24px' }}>
        <button className="btn-blue" disabled={!name.trim()} onClick={() => onConfirm({ name: name.trim(), phone: phone.trim(), role: role.trim() || 'Contact' })}>Confirm</button>
      </div>
    </div>
  )
}

// ─── Data & Privacy screen ────────────────────────────────────────────────────
function DataPrivacy({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Data & Privacy" onBack={onBack}/>
      <div style={{ flex: 1, minHeight: 0, padding: '4px 20px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="no-scrollbar">
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.7 }}>We collect and use your personal data to provide the safety and location-sharing features of our app.</p>

        {[
          { h: 'Location Data', body: 'When you choose to use our safety or location-sharing features, the app may collect your device\'s location data, including GPS location, in order to allow your designated Trusted Contact to follow your location while you are using the feature.\n\nYour location is shared with your Trusted Contact only when you have enabled the relevant location-sharing or safety feature. The purpose of collecting and sharing this information is to help your Trusted Contact monitor your location while you are, for example, running, walking, cycling, or otherwise traveling alone.\n\nDepending on the feature you use, location data may be collected while the app is running in the background so that your Trusted Contact can receive an up-to-date view of your location.\n\nWe do not use your location data for advertising or sell your location data to third parties.' },
          { h: 'Name and Phone Number', body: 'We may collect your name and phone number to create and manage your account, identify you within the app, and enable communication and safety features.\n\nYour phone number may also be used to help establish or manage your relationship with your Trusted Contact and to support account verification and security.' },
          { h: 'Trusted Contact Information', body: 'If you designate another person as your Trusted Contact, we may process information necessary to provide the Trusted Contact functionality, such as their name, phone number, account identifier, or device information required to deliver notifications through the app.\n\nYou are responsible for providing accurate information and, where applicable, ensuring that you have the appropriate permission to provide another person\'s personal information to us.' },
          { h: 'Push Notifications', body: 'We use push notifications to provide important safety-related updates to you and your Trusted Contact.\n\nFor example, when you start or stop a location-sharing session, when a safety feature is activated, or when another relevant event occurs, the app may send a notification to the appropriate user.\n\nTo deliver push notifications, we may process technical information associated with the recipient\'s device, such as a device or push-notification token. These tokens are used to route notifications to the correct device and are not used to determine your physical location.' },
          { h: 'How We Use Your Data', body: 'We may use your personal data to:\n\n• provide and operate the app and its safety features;\n• collect and share your location with your Trusted Contact when you have enabled location sharing;\n• allow Trusted Contacts to view your location during an active safety or location-sharing session;\n• send safety-related push notifications and alerts;\n• create and manage user accounts;\n• verify your identity and secure your account;\n• communicate with you about the app and its services;\n• detect, prevent, and investigate fraud, misuse, security incidents, or unauthorized access;\n• maintain, troubleshoot, and improve the app and its functionality; and\n• comply with applicable legal obligations.\n\nWe only use your personal data for purposes that are relevant to providing, securing, and improving our services, or as otherwise permitted or required by applicable law.' },
          { h: 'Your Control Over Location Sharing', body: 'Location sharing is under your control. You can choose whether to start or stop a location-sharing or safety session, subject to the functionality of the app.\n\nWhen location sharing is stopped, we will no longer share your current location with your Trusted Contact through that active session.\n\nYou can also manage or remove your Trusted Contact through the app, where this functionality is available.\n\nFor more information about the types of personal data we collect, the legal bases for processing, how long we retain your data, who we share it with, and your rights, please see our full Privacy Policy.' },
        ].map(s => (
          <div key={s.h}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18', marginBottom: 8, fontFamily: 'Outfit,sans-serif' }}>{s.h}</p>
            <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Help & Support screen ────────────────────────────────────────────────────
function HelpSupport({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Help & Support" onBack={onBack}/>
      <div style={{ flex: 1, minHeight: 0, padding: '4px 20px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="no-scrollbar">
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.7 }}>We're here to help you stay safe and get the most out of the app.</p>

        {[
          { h: 'Need Help?', body: 'If you are experiencing a problem or have a question, contact our support team on safe_journey@gmail.com.\n\nWhen contacting support, please include as much relevant information as possible, such as a description of the issue, the device you are using, and the app version. Please do not include unnecessary personal or sensitive information.' },
          { h: 'Safety Issues', body: 'If the app is not working as expected during an active safety or location-sharing session, do not rely solely on the app to protect you.\n\nIf you are in immediate danger or need emergency assistance, contact your local emergency services.' },
          { h: 'Privacy Questions', body: 'If you have questions about how we collect, use, share, or protect your personal data, please review our Privacy Policy or contact us through the support options provided in the app.' },
          { h: 'Feedback', body: "We welcome your feedback. If you have suggestions for improving the app or its safety features, please let us know.\n\nWe're continuously working to make the app more reliable, useful, and safe." },
        ].map(s => (
          <div key={s.h}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18', marginBottom: 8 }}>{s.h}</p>
            <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── About SafeJourney screen ─────────────────────────────────────────────────
function AboutSafeJourney({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="About SafeJourney" onBack={onBack}/>
      <div style={{ flex: 1, minHeight: 0, padding: '4px 20px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="no-scrollbar">
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18', marginBottom: 8 }}>About Us</p>
          <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75 }}>We created this app with one simple thought in mind: everyone should feel free to go wherever they want, while the people who care about them can have peace of mind.</p>
        </div>
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75 }}>The idea came from something very personal. My younger sister loves going for runs and walks on her own, and, like many older sisters, I often found myself checking her location just to make sure she was okay. I realized there had to be a better way. One that didn't require me, or anyone else, to constantly watch a map.</p>
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75 }}>That's how the idea for our app was born.</p>
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75 }}>Instead of asking someone to follow your every move, the app lets you plan your journey, choose a trusted buddy, and simply go. Your buddy knows when you start, but they don't need to watch your location throughout the journey. The app quietly keeps an eye on the things that matter, and if something unexpected happens, such as leaving the planned route, staying in one place for too long, or detecting a fall, your buddy is alerted right away.</p>
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75 }}>Because safety shouldn't mean giving up your freedom. And caring about someone shouldn't mean constantly worrying about them.</p>
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75 }}>Whether you're going for a run, taking a walk, rollerblading, hiking, or simply heading out on your own, we want you to feel confident knowing that someone you trust will know if something changes.</p>
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75 }}>We built this for our sisters, daughters, friends, partners, and for anyone who wants to explore the world independently while knowing that someone has their back.</p>
        <p style={{ fontSize: 13, color: '#5A4A40', lineHeight: 1.75, fontStyle: 'italic' }}>Go your way. We'll help keep someone you trust in the loop.</p>
      </div>
    </div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onNav, routeInfo, userName, completedJourneys }: {
  onNav: (s: Screen) => void
  routeInfo: RouteInfo | null
  userName: string
  completedJourneys: CompletedJourney[]
}) {
  const recent = completedJourneys.slice(0, 3)
  const formatDate = (d: Date) => {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const statusColor = (s: CompletedJourney['status']) => s === 'normal' ? '#4A7C59' : '#C4713A'

  return (
    <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar pb-4">
      <div style={{ padding: '56px 20px 16px' }}>
        <p style={{ fontSize: 13, color: '#7A6860', fontWeight: 500 }}>Good evening</p>
        <h1 className="font-display" style={{ fontSize: 34, color: '#2A1F18', lineHeight: 1.1, marginTop: 2 }}>{userName}</h1>
        <p style={{ fontSize: 13, color: '#A09080', marginTop: 4 }}>Ready for your journey?</p>
      </div>

      <div style={{ margin: '0 16px 16px' }}>
        <div className="glass-dark" style={{ borderRadius: 28, padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -24, right: -24, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,221,251,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', bottom: -16, left: 60, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,221,209,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(200,221,251,0.18)', border: '1px solid rgba(200,221,251,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: '#C8DDFB' }}>
            <div style={{ width: 20, height: 20 }}>{I.shield}</div>
          </div>
          <h2 className="font-display" style={{ color: '#fff', fontSize: 22, marginBottom: 6 }}>Start a Journey</h2>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 13, lineHeight: 1.55, marginBottom: 20 }}>
            {routeInfo ? `Continue with your saved route — ${routeInfo.name}` : 'Plan your route and choose who should watch over you.'}
          </p>
          <button className="btn-blue" style={{ width: 'auto', padding: '11px 22px', fontSize: 14 }} onClick={() => onNav('create-journey')}>
            {routeInfo ? 'Edit or start journey' : 'Start Journey'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#2A1F18' }}>Recent journeys</p>
          <button onClick={() => onNav('history')} style={{ fontSize: 12, fontWeight: 600, color: '#3D6B4F', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent.length === 0 ? (
            <p style={{ fontSize: 13, color: '#A09080', padding: '8px 4px' }}>No recent journeys yet.</p>
          ) : (
            recent.map((j) => (
              <GCard key={j.id} className="px-4 py-3.5 flex items-center gap-3">
                <div className="glass-2" style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>{ACTIVITY_EMOJIS[j.activityType as keyof typeof ACTIVITY_EMOJIS] ?? ACTIVITY_EMOJIS.run}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#2A1F18' }}>{j.name}</p>
                  <p style={{ fontSize: 11, color: '#9A8880', marginTop: 2 }}>{j.distanceKm.toFixed(1)} km · {j.durationMin} min</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#A09080' }}>{formatDate(j.completedAt)}</span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(j.status) }}/>
                </div>
              </GCard>
            ))
          )}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <GCard className="p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#2A1F18' }}>Your Safety Circle</p>
            <button onClick={() => onNav('safety-circle')} style={{ fontSize: 11, fontWeight: 600, color: '#3D6B4F', background: 'none', border: 'none', cursor: 'pointer' }}>Manage</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {['Ana', 'Marko', 'Sara'].map(n => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Avatar name={n} size="sm" active={n === 'Ana'} online={n === 'Ana'}/>
                <span style={{ fontSize: 10, color: '#8A7870' }}>{n}</span>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <button onClick={() => onNav('safety-circle')}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px dashed rgba(180,160,150,0.55)', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <div style={{ width: 12, height: 12, color: '#9A8880' }}>{I.plus}</div>
              </button>
              <span style={{ fontSize: 10, color: '#8A7870', opacity: 0 }}>·</span>
            </div>
          </div>
        </GCard>
      </div>
    </div>
  )
}

// ─── Create Journey ───────────────────────────────────────────────────────────
function CreateJourney({ onConfirm, onBack }: { onConfirm: (info: RouteInfo) => void; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Plan your journey" subtitle="Tap the map to draw your route." onBack={onBack}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Suspense fallback={<MapLoader/>}>
          <MapPlanner onConfirm={onConfirm}/>
        </Suspense>
      </div>
    </div>
  )
}

// ─── Safety Buddy ─────────────────────────────────────────────────────────────
function SafetyBuddy({ contacts, onNext, onBack, onAddContact }: {
  contacts: Contact[]
  onNext: (buddy: string) => void
  onBack: () => void
  onAddContact: () => void
}) {
  const [sel, setSel] = useState(contacts[0]?.name ?? '')
  useEffect(() => { if (!contacts.find(c => c.name === sel) && contacts.length) setSel(contacts[0].name) }, [contacts])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Who should watch over you?" subtitle="They'll only be notified if something unusual happens." onBack={onBack}/>
      <div style={{ flex: 1, padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }} className="no-scrollbar">
        {contacts.map(c => {
          const isSelected = sel === c.name
          return (
            <button key={c.name} onClick={() => setSel(c.name)}
              style={{ width: '100%', textAlign: 'left', borderRadius: 20, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.18s', background: isSelected ? 'rgba(200,221,251,0.42)' : 'rgba(255,255,255,0.30)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: isSelected ? '2px solid rgba(160,200,255,0.60)' : '1px solid rgba(255,255,255,0.58)', boxShadow: isSelected ? '0 4px 20px rgba(120,170,255,0.14), inset 0 1px 0 rgba(255,255,255,0.70)' : 'inset 0 1px 0 rgba(255,255,255,0.72)', cursor: 'pointer' }}>
              <Avatar name={c.name} size="md" active={isSelected} online={isSelected}/>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18' }}>{c.name}</p>
                <p style={{ fontSize: 12, color: '#7A6860', marginTop: 2 }}>{c.role}</p>
              </div>
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isSelected ? 'linear-gradient(135deg, #5DBB7A, #3A9A5C)' : 'rgba(255,255,255,0.30)', border: isSelected ? '1px solid rgba(255,255,255,0.40)' : '1.5px dashed rgba(180,160,150,0.45)', boxShadow: isSelected ? '0 2px 8px rgba(50,110,65,0.25)' : 'none' }}>
                {isSelected && <div style={{ width: 12, height: 12, color: 'white' }}>{I.check}</div>}
              </div>
            </button>
          )
        })}

        <button onClick={onAddContact}
          style={{ width: '100%', borderRadius: 20, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1.5px dashed rgba(180,160,150,0.45)', color: '#8A7870', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <div style={{ width: 16, height: 16 }}>{I.plus}</div>
          Add trusted contact
        </button>
      </div>
      <div style={{ padding: '12px 16px 24px' }}>
        <button className="btn-blue" onClick={() => onNext(sel)}>Continue with {sel}</button>
      </div>
    </div>
  )
}

// ─── Journey Review ───────────────────────────────────────────────────────────
function JourneyReview({ routeInfo, buddy, onStart, onBack }: {
  routeInfo: RouteInfo | null; buddy: string; onStart: () => void; onBack: () => void
}) {
  const eta = (() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + (routeInfo?.estimatedMinutes ?? 35))
    return now.toTimeString().slice(0, 5)
  })()
  const activityLabel: Record<string, string> = {
    run: `${ACTIVITY_EMOJIS.run} Solo Run`,
    walk: `${ACTIVITY_EMOJIS.walk} Solo Walk`,
    hike: `${ACTIVITY_EMOJIS.hike} Solo Hike`,
    cycle: `${ACTIVITY_EMOJIS.cycle} Solo Cycle`,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Ready to go?" onBack={onBack}/>
      <div style={{ flex: 1, padding: '8px 16px 0', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }} className="no-scrollbar">
        <GCard className="overflow-hidden">
          <div className="glass-dark" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(200,221,251,0.18)', border: '1px solid rgba(200,221,251,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>{routeInfo ? ACTIVITY_EMOJIS[routeInfo.activityType] : ACTIVITY_EMOJIS.run}</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{routeInfo ? activityLabel[routeInfo.activityType] : `${ACTIVITY_EMOJIS.run} Solo Run`}</p>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12, marginTop: 2 }}>This evening</p>
            </div>
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '📍', label: 'Route', value: routeInfo ? `${routeInfo.distance.toFixed(2)} km` : '5.2 km' },
              { icon: '🗺', label: 'Name', value: routeInfo?.name ?? 'Custom Route' },
              { icon: '⏱', label: 'Estimated duration', value: routeInfo ? `${routeInfo.estimatedMinutes} min` : '35 min' },
              { icon: '🕐', label: 'Expected arrival', value: eta },
              { icon: '👤', label: 'Safety buddy', value: buddy },
              { icon: '🔒', label: 'Location sharing', value: 'During journey only' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: '#7A6860' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2A1F18', maxWidth: 160, textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </GCard>
        <GCard tint="green" className="p-4">
          <p style={{ fontSize: 13, color: '#1E4D31', lineHeight: 1.55 }}>
            <strong>{buddy}</strong> will receive a notification when you start and when you arrive. They'll only receive an additional alert if something unusual happens.
          </p>
        </GCard>
        <button className="btn-ghost" onClick={onBack}>Edit</button>
      </div>
      <div style={{ padding: '12px 16px 24px' }}>
        <button className="btn-green" onClick={onStart}>Start Journey</button>
      </div>
    </div>
  )
}

// ─── Active Journey ───────────────────────────────────────────────────────────
function ActiveJourney({ state, routeInfo, buddy, onNav }: {
  state: JState
  routeInfo: RouteInfo | null
  buddy: string
  onNav: (s: Screen) => void
}) {
  const isNormal  = state === 'normal'
  const isStop    = state === 'unusual-stationary'
  const isOff     = state === 'unusual-offroute'
  const isConcern = state === 'concern-fall'
  const isFall    = state === 'concern-fall'

  const bannerTint: 'green' | 'amber' | 'red' = isConcern ? 'red' : isStop ? 'amber' : isOff ? 'red' : 'green'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ margin: '12px 14px 8px' }}>
        <GCard tint={bannerTint} className="px-4 py-3">
          {isNormal  && <StatusBadge state="normal" buddyName={buddy}/>}
          {isStop    && <StatusBadge state="unusual" buddyName={buddy}/>}
          {isOff     && <StatusBadge state="concern" buddyName={buddy}/>}
          {isConcern && <StatusBadge state="concern" buddyName={buddy}/>}
          <p style={{ fontSize: 12, color: '#5A4A40', marginTop: 6, lineHeight: 1.5 }}>
            {isNormal  && "You're on your planned route."}
            {isStop    && "You've been stationary for 5 minutes. Everything okay?"}
            {isOff     && "Did you take a different route?"}
            {isFall    && "A possible fall was detected. Your buddy has been notified."}
          </p>
        </GCard>
      </div>

      <div style={{ margin: '0 14px', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.48)', boxShadow: '0 4px 20px rgba(80,60,40,0.10)', height: 200, flexShrink: 0, position: 'relative' }}>
        {routeInfo && routeInfo.points.length > 1 ? (
          <Suspense fallback={<MapLoader/>}>
            <ActiveJourneyMap route={routeInfo.points}/>
          </Suspense>
        ) : (
          <StaticFallbackMap variant={isConcern ? 'concern' : isOff ? 'offroute' : 'normal'} className="w-full h-full"/>
        )}
      </div>

      {isConcern && (
        <div style={{ margin: '8px 14px 0' }}>
          <GCard tint="red" className="px-4 py-3">
            {(isFall
              ? [['📱','Fall detected','Possible fall'],['⏰','Expected arrival','overdue']]
              : [['📍','Off planned route','420 m'],['⏸','Stationary','8 min'],['⏰','Expected arrival','6 min ago']]
            ).map(([ic, lb, vl]) => (
              <div key={lb} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{ic}</span>
                <span style={{ fontSize: 12, color: '#7A6860', flex: 1 }}>{lb}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#A03030' }}>{vl}</span>
              </div>
            ))}
          </GCard>
        </div>
      )}
      {isOff && (
        <div style={{ margin: '8px 14px 0' }}>
          <GCard tint="red" className="px-4 py-3 flex items-center gap-2">
            <span style={{ fontSize: 13 }}>📍</span>
            <span style={{ fontSize: 12, color: '#7A6860', flex: 1 }}>Distance from planned route</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#8A2020' }}>350 m</span>
          </GCard>
        </div>
      )}
      {isStop && (
        <div style={{ margin: '8px 14px 0' }}>
          <GCard className="px-4 py-3">
            {[['⏸','Stopped','5 min'],['📍','Location','Oak Street']].map(([ic,lb,vl]) => (
              <div key={lb} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{ic}</span>
                <span style={{ fontSize: 12, color: '#7A6860', flex: 1 }}>{lb}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#2A1F18' }}>{vl}</span>
              </div>
            ))}
          </GCard>
        </div>
      )}
      {isNormal && (
        <div style={{ margin: '8px 14px 0' }}>
          <GCard className="px-4 py-3 flex justify-between">
            {[['ETA','20:43'],['Remaining', routeInfo ? `${(routeInfo.distance * 0.4).toFixed(1)} km` : '2.1 km'],['Time','21 min']].map(([lb,vl]) => (
              <div key={lb} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: '#A09080' }}>{lb}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18', marginTop: 2 }}>{vl}</p>
              </div>
            ))}
          </GCard>
        </div>
      )}

      <div style={{ flex: 1 }}/>

      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isNormal && (
          <>
            <button className="btn-ghost" onClick={() => {}}>Check in</button>
            <button onClick={() => onNav('arrival')} style={{ padding: '10px', fontSize: 13, color: '#9A8880', fontFamily: 'Outfit,sans-serif', cursor: 'pointer', background: 'none', border: 'none' }}>End journey</button>
          </>
        )}
        {(isStop || isOff || isFall) && (
          <>
            <button className="btn-green" onClick={() => onNav('active-journey')}>I'm okay</button>
            <button className="btn-ghost" onClick={() => {}}>Call {buddy}</button>
            <button onClick={() => onNav('arrival')} style={{ padding: '8px', fontSize: 12, color: '#9A8880', fontFamily: 'Outfit,sans-serif', cursor: 'pointer', background: 'none', border: 'none' }}>End journey</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Safe Arrival ─────────────────────────────────────────────────────────────
function Arrival({ routeInfo, buddy, onDone, onViewJourneys }: {
  routeInfo: RouteInfo | null; buddy: string; onDone: () => void; onViewJourneys: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <div className="glass-1" style={{ width: 110, height: 110, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 16px rgba(180,225,195,0.10), inset 0 1px 0 rgba(255,255,255,0.80)' }}>
            <div style={{ width: 36, height: 36, color: '#3D6B4F' }}>{I.heart}</div>
          </div>
        </div>

        <h1 className="font-display" style={{ fontSize: 42, color: '#2A1F18', marginBottom: 8 }}>You made it.</h1>
        <p style={{ color: '#7A6860', fontSize: 15, marginBottom: 28 }}>Your journey is complete.</p>

        <GCard className="w-full p-5 mb-5">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              [routeInfo ? `${routeInfo.distance.toFixed(1)} km` : '5.2 km', 'Distance'],
              [routeInfo ? `${routeInfo.estimatedMinutes} min` : '34 min', 'Duration'],
              [new Date().toTimeString().slice(0,5), 'Arrival'],
            ].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 17, fontWeight: 600, color: '#2A1F18' }}>{v}</p>
                <p style={{ fontSize: 11, color: '#A09080', marginTop: 2 }}>{l}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.40)' }}>
            <StatusBadge state="normal" buddyName={buddy}/>
            <p style={{ fontSize: 11, color: '#7A6860', marginTop: 8 }}>Journey completed</p>
          </div>
        </GCard>

        <GCard tint="green" className="w-full p-4 flex items-center gap-3">
          <Avatar name={buddy} size="sm" active={false}/>
          <p style={{ fontSize: 13, color: '#1E4D31', lineHeight: 1.5 }}>
            <strong>{buddy}</strong> has been notified that you arrived safely.
          </p>
        </GCard>
      </div>

      <div style={{ padding: '8px 16px 36px', width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-blue" onClick={onDone}>Done</button>
        <button className="btn-ghost" onClick={onViewJourneys}>View journey details</button>
      </div>
    </div>
  )
}

// ─── Buddy Web View ───────────────────────────────────────────────────────────
function BuddyWebView({ buddy, onBack }: { routeInfo: RouteInfo | null; buddy: string; onBack: () => void; userName: string }) {
  const runnerName = 'Mika'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="glass-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.35)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, color: '#3D6B4F' }}>{I.shield}</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3D6B4F' }}>SafeJourney</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18', marginTop: 2 }}>{runnerName}'s Journey</p>
        </div>
        <StatusBadge state="normal" buddyName={buddy}/>
      </div>

      <div style={{ height: 200, flexShrink: 0, position: 'relative' }}>
        <StaticFallbackMap variant="buddy" className="w-full h-full"/>
      </div>

      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }} className="no-scrollbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.35)' }}>
          <Avatar name={runnerName} active online/>
          <div>
            <p style={{ fontWeight: 600, color: '#2A1F18', fontSize: 14 }}>{runnerName}</p>
            <p style={{ fontSize: 11, color: '#3D6B4F', marginTop: 2 }}>Running · Active now</p>
          </div>
        </div>

        {[
          ['Started', '20:10'],
          ['ETA', '20:43'],
          ['Distance', '3.1 km / 5.2 km'],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#7A6860' }}>{l}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2A1F18' }}>{v}</span>
          </div>
        ))}

        <div className="glass-1" style={{ height: 6, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, #4A7C59, #5DBB7A)', borderRadius: 999 }}/>
        </div>

        <GCard tint="blue" className="p-4">
          <p style={{ fontSize: 13, color: '#1A3A6A', lineHeight: 1.55 }}>You don't need to keep watching. We'll let you know if something changes.</p>
        </GCard>

        <button className="btn-blue">Call {runnerName}</button>
      </div>
    </div>
  )
}

// ─── Buddy Alert ──────────────────────────────────────────────────────────────
function BuddyAlert({ onBack }: { routeInfo: RouteInfo | null; onBack: () => void; userName: string }) {
  const runnerName = 'Mika'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="glass-amber px-5 py-4" style={{ borderBottom: '1px solid rgba(255,210,140,0.40)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 16, height: 16, color: '#C47A25' }}>{I.warning}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6A3800' }}>SafeJourney</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18' }}>{runnerName}'s journey looks unusual</p>
        <p style={{ fontSize: 11, color: '#8A7870', marginTop: 2 }}>Received just now</p>
      </div>

      <div style={{ height: 190, flexShrink: 0 }}>
        <StaticFallbackMap variant="offroute" className="w-full h-full"/>
      </div>

      <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }} className="no-scrollbar">
        <p style={{ fontSize: 13, fontWeight: 600, color: '#2A1F18' }}>What we noticed</p>
        {[['📍','Off planned route','350 m'],['⏸','Stationary','7 min'],['⏰','ETA overdue','6 min']].map(([ic,lb,vl]) => (
          <GCard key={lb} tint="amber" className="px-4 py-3 flex items-center gap-2">
            <span style={{ fontSize: 14 }}>{ic}</span>
            <span style={{ fontSize: 13, color: '#7A6860', flex: 1 }}>{lb}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#8A4020' }}>{vl}</span>
          </GCard>
        ))}
      </div>

      <div style={{ padding: '8px 16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          Call {runnerName}
        </button>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16 }}>{I.message}</div> Message {runnerName}
        </button>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16 }}>{I.location}</div> View live location
        </button>
        <button onClick={onBack} style={{ padding: '8px', fontSize: 12, color: '#A09080', fontFamily: 'Outfit,sans-serif', cursor: 'pointer', background: 'none', border: 'none' }}>Back</button>
      </div>
    </div>
  )
}

// ─── Buddy Alert Tracking ─────────────────────────────────────────────────────
function BuddyAlertTracking({ alertType, onBack }: {
  routeInfo: RouteInfo | null
  alertType: 'offroute' | 'stopped' | 'fall'
  onBack: () => void
  userName: string
}) {
  const runnerName = 'Mika'
  const alertMsg = alertType === 'fall'
    ? `Possible fall detected for ${runnerName}`
    : alertType === 'stopped'
    ? `${runnerName} has stopped for 10 minutes`
    : `${runnerName} is off route`

  const mapVariant = alertType === 'fall' ? 'concern' : 'offroute'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="glass-dark" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, color: '#C8DDFB' }}>{I.shield}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#C8DDFB' }}>SafeJourney</span>
        </div>
        <button onClick={onBack} style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>← Back</button>
      </div>

      <div style={{ height: 220, flexShrink: 0, position: 'relative' }}>
        <StaticFallbackMap variant={mapVariant} className="w-full h-full"/>
      </div>

      <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }} className="no-scrollbar">
        <GCard tint={alertType === 'fall' ? 'red' : 'amber'} className="p-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 18, height: 18, color: alertType === 'fall' ? '#C43A3A' : '#C47A25' }}>{I.warning}</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18' }}>{alertMsg}</p>
          </div>
          <p style={{ fontSize: 12, color: '#7A6860' }}>Received just now</p>
        </GCard>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={runnerName} active online/>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#2A1F18' }}>{runnerName}</p>
            <p style={{ fontSize: 12, color: '#7A6860', marginTop: 2 }}>Journey active · Safety alert</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          Call {runnerName}
        </button>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16 }}>{I.message}</div> Check in
        </button>
      </div>
    </div>
  )
}

// ─── Safety Circle ────────────────────────────────────────────────────────────
function SafetyCircle({ contacts, onBack, onAddPerson, onEdit, onRemove }: {
  contacts: Contact[]
  onBack: () => void
  onAddPerson: () => void
  onEdit: (index: number) => void
  onRemove: (index: number) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Your Safety Circle" subtitle="People you trust to look out for you." onBack={onBack}/>
      <div style={{ flex: 1, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }} className="no-scrollbar pb-4">
        {contacts.map((m, index) => (
          <GCard key={m.name} className="p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={m.name} active online/>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#2A1F18', fontSize: 14 }}>{m.name}</p>
                <p style={{ fontSize: 11, color: '#7A6860', marginTop: 2 }}>{m.role}</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => onEdit(index)} style={{ fontSize: 11, fontWeight: 600, color: '#3D6B4F', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => onRemove(index)} style={{ fontSize: 11, color: '#A09080', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            </div>
          </GCard>
        ))}

        <button onClick={onAddPerson}
          style={{ width: '100%', borderRadius: 20, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1.5px dashed rgba(180,160,150,0.45)', color: '#8A7870', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <div style={{ width: 16, height: 16 }}>{I.plus}</div> Add person
        </button>

        <GCard tint="blue" className="p-4 flex gap-3">
          <div style={{ width: 16, height: 16, color: '#1A4A7A', flexShrink: 0, marginTop: 1 }}>{I.lock}</div>
          <p style={{ fontSize: 12, color: '#2A5A9A', lineHeight: 1.55 }}>People in your Safety Circle only see your location during an active journey you share with them.</p>
        </GCard>
      </div>
    </div>
  )
}

// ─── Journey History / Your Journeys ─────────────────────────────────────────
function History({ onBack, completedJourneys }: { onBack: () => void; completedJourneys: CompletedJourney[] }) {
  const [filter, setFilter] = useState<'all' | 'normal' | 'unusual'>('all')
  const formatDate = (d: Date) => {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const isNormal = (j: CompletedJourney) => j.status === 'normal'
  const shown = filter === 'all' ? completedJourneys : completedJourneys.filter(j => filter === 'normal' ? isNormal(j) : !isNormal(j))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Your journeys" onBack={onBack}/>
      <div style={{ display: 'flex', gap: 8, padding: '4px 16px 12px' }}>
        {(['all','normal','unusual'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 500, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s', ...(filter === f ? { background: 'rgba(200,221,251,0.60)', color: '#0A1A3A', border: '1px solid rgba(200,221,251,0.65)', backdropFilter: 'blur(14px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.62)' } : { background: 'rgba(255,255,255,0.28)', color: '#6A5848', border: '1px solid rgba(255,255,255,0.48)', backdropFilter: 'blur(12px)' }) }}>{f}</button>
        ))}
      </div>
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }} className="no-scrollbar pb-6">
        {shown.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>{ACTIVITY_EMOJIS.run}</p>
            <p style={{ fontWeight: 600, color: '#2A1F18' }}>Nothing here yet</p>
            <p style={{ fontSize: 13, color: '#A09080', marginTop: 4 }}>Your completed journeys will appear here.</p>
          </div>
        )}
        {shown.map((j) => (
          <GCard key={j.id} className="px-4 py-4 flex items-start gap-3">
            <div className="glass-2" style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>{ACTIVITY_EMOJIS[j.activityType as keyof typeof ACTIVITY_EMOJIS] ?? ACTIVITY_EMOJIS.run}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 600, color: '#2A1F18', fontSize: 13 }}>{j.name}</p>
                <span style={{ fontSize: 11, color: '#A09080' }}>{formatDate(j.completedAt)}</span>
              </div>
              <p style={{ fontSize: 11, color: '#8A7870', marginTop: 2 }}>{j.distanceKm.toFixed(1)} km · {j.durationMin} min</p>
              {j.status !== 'normal' && (
                <span className="glass-amber" style={{ display: 'inline-block', fontSize: 10, color: '#8A4020', padding: '3px 8px', borderRadius: 8, marginTop: 6 }}>
                  {j.status === 'offroute' ? 'Route changed · User confirmed okay' : j.status === 'stopped' ? 'Stationary alert' : 'Fall detected'}
                </span>
              )}
            </div>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: j.status === 'normal' ? '#4A7C59' : '#C4713A', flexShrink: 0, marginTop: 4 }}/>
          </GCard>
        ))}
      </div>
    </div>
  )
}

// ─── Buddy Journey View ───────────────────────────────────────────────────────
// Example route for friend's journey (real coords — will be replaced with live data in Cursor)
const BUDDY_EXAMPLE_ROUTE: [number, number][] = [
  [60.1699, 24.9384],
  [60.1715, 24.9412],
  [60.1738, 24.9448],
  [60.1762, 24.9470],
  [60.1790, 24.9455],
  [60.1812, 24.9428],
  [60.1830, 24.9395],
  [60.1845, 24.9358],
  [60.1838, 24.9322],
  [60.1815, 24.9295],
  [60.1788, 24.9275],
  [60.1758, 24.9280],
  [60.1730, 24.9305],
  [60.1710, 24.9338],
  [60.1699, 24.9384],
]

function BuddyJourneyView({ buddyJState }: {
  routeInfo: RouteInfo | null
  userName: string
  buddyJState: 'normal' | 'stopped' | 'offroute' | 'fall'
}) {
  const runnerName = 'Mika'
  const isNormal = buddyJState === 'normal'
  const isStopped = buddyJState === 'stopped'
  const isOffRoute = buddyJState === 'offroute'
  const isFall = buddyJState === 'fall'

  const badgeState: 'normal' | 'unusual' | 'concern' = isNormal ? 'normal' : isStopped ? 'unusual' : 'concern'
  const alertTint: 'amber' | 'red' = isStopped ? 'amber' : 'red'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }} className="no-scrollbar">

      {/* Header — BuddyWebView layout */}
      <div className="glass-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.35)', padding: '14px 18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, color: '#3D6B4F' }}>{I.shield}</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3D6B4F' }}>SafeJourney</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18', marginTop: 2 }}>{runnerName}'s Journey</p>
        </div>
        {isNormal && <StatusBadge state="normal" buddyName={runnerName}/>}
      </div>

      {/* Real interactive Leaflet map */}
      <div style={{ height: 200, flexShrink: 0, position: 'relative' }}>
        <Suspense fallback={<MapLoader/>}>
          <ActiveJourneyMap route={BUDDY_EXAMPLE_ROUTE}/>
        </Suspense>
      </div>

      {/* State-dependent info area */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isNormal ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.35)' }}>
              <Avatar name={runnerName} active online/>
              <div>
                <p style={{ fontWeight: 600, color: '#2A1F18', fontSize: 14 }}>{runnerName}</p>
                <p style={{ fontSize: 11, color: '#3D6B4F', marginTop: 2 }}>Running · Active now</p>
              </div>
            </div>
            {[['Started','20:10'],['ETA','20:43'],['Distance','3.1 km / 5.2 km']].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#7A6860' }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2A1F18' }}>{v}</span>
              </div>
            ))}
            <div className="glass-1" style={{ height: 6, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, #4A7C59, #5DBB7A)', borderRadius: 999 }}/>
            </div>
            <GCard tint="blue" className="p-4">
              <p style={{ fontSize: 13, color: '#1A3A6A', lineHeight: 1.55 }}>You don't need to keep watching. We'll let you know if something changes.</p>
            </GCard>
          </>
        ) : (
          <>
            <GCard tint={alertTint} className="p-4">
              <StatusBadge
                state={badgeState}
                buddyName={runnerName}
                label={
                  isStopped ? `${runnerName} has stopped`
                  : isOffRoute ? `${runnerName} is off route`
                  : 'Possible fall detected'
                }
              />
              <p style={{ fontSize: 12, color: '#5A4A40', marginTop: 6, lineHeight: 1.5 }}>
                {isStopped
                  ? `${runnerName} has been stationary for 8 minutes.`
                  : isOffRoute
                  ? `${runnerName} has moved outside the planned route.`
                  : `A possible fall was detected during ${runnerName}'s journey.`}
              </p>
            </GCard>
            <GCard className="px-4 py-3 flex justify-between">
              {[['ETA','20:43'],['Distance','3.1 km'],['Time','21 min']].map(([lb,vl]) => (
                <div key={lb} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#A09080' }}>{lb}</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18', marginTop: 2 }}>{vl}</p>
                </div>
              ))}
            </GCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={runnerName} active online/>
              <div>
                <p style={{ fontWeight: 600, color: '#2A1F18', fontSize: 14 }}>{runnerName}</p>
                <p style={{ fontSize: 11, color: '#7A6860', marginTop: 2 }}>Journey active · Safety alert</p>
              </div>
            </div>
            <button className="btn-blue">Call {runnerName}</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Buddy State Picker (demo control) ───────────────────────────────────────
function BuddyStatePicker({ cur, set }: { cur: 'normal' | 'stopped' | 'offroute' | 'fall'; set: (s: 'normal' | 'stopped' | 'offroute' | 'fall') => void }) {
  const opts: { key: 'normal' | 'stopped' | 'offroute' | 'fall'; label: string }[] = [
    { key: 'normal',   label: '🟢 Normal' },
    { key: 'stopped',  label: '🟡 Stop' },
    { key: 'offroute', label: '🔴 Off Route' },
    { key: 'fall',     label: '🔴 Fall' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.28)', overflowX: 'auto' }} className="no-scrollbar">
      {opts.map(o => (
        <button key={o.key} onClick={() => set(o.key)}
          style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 12, fontSize: 11, fontWeight: 500, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'all 0.15s', ...(cur === o.key ? { background: 'rgba(255,255,255,0.85)', color: '#2A1F18', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.70)' } : { background: 'transparent', color: '#5A4A40', border: 'none' }) }}>{o.label}</button>
      ))}
    </div>
  )
}

// ─── Tracking Screen (buddy view) ─────────────────────────────────────────────
function TrackingScreen({ journeyActive, routeInfo, userName, buddyJState, setBuddyJState }: {
  journeyActive: boolean
  routeInfo: RouteInfo | null
  userName: string
  buddyJState: 'normal' | 'stopped' | 'offroute' | 'fall'
  setBuddyJState: (s: 'normal' | 'stopped' | 'offroute' | 'fall') => void
}) {
  if (!journeyActive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header title="Tracking"/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div className="glass-1" style={{ width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, color: '#9A8880' }}>{I.map}</div>
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#2A1F18', marginBottom: 8 }}>No journeys to track at the moment.</p>
          <p style={{ fontSize: 13, color: '#9A8880', lineHeight: 1.6 }}>When a friend starts a journey with you as their buddy, their route will appear here.</p>
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Header title="Tracking"/>
      <BuddyStatePicker cur={buddyJState} set={setBuddyJState}/>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <BuddyJourneyView routeInfo={routeInfo} userName={userName} buddyJState={buddyJState}/>
      </div>
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function Profile({ onBack, onSettings, userName, userEmail, onDataPrivacy, onDeleteAccount }: {
  onBack: () => void; onSettings: () => void
  userName: string; userEmail: string
  onDataPrivacy: () => void; onDeleteAccount: () => void
}) {
  const [locShare, setLocShare] = useState(true)
  const [autoEnd, setAutoEnd] = useState(true)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Privacy & Safety" onBack={onBack}/>
      <div style={{ flex: 1, padding: '4px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="no-scrollbar pb-4">
        <GCard tint="pink" className="p-4 flex items-center gap-4">
          <Avatar name={userName || 'U'} size="lg" active={false}/>
          <div>
            <p style={{ fontWeight: 600, color: '#2A1F18', fontSize: 14 }}>{userName || 'Your name'}</p>
            <p style={{ fontSize: 12, color: '#7A6860', marginTop: 2 }}>{userEmail || 'your@email.com'}</p>
          </div>
        </GCard>

        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Privacy & Location</p>
          <GCard>
            {[
              { label: 'Location sharing', sub: 'Only while a journey is active', toggle: true, val: locShare, set: setLocShare },
              { label: 'Automatic journey ending', sub: 'Stop sharing when you arrive', toggle: true, val: autoEnd, set: setAutoEnd },
            ].map((item: any) => (
              <div key={item.label} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.38)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#2A1F18' }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: '#A09080', marginTop: 2 }}>{item.sub}</p>
                </div>
                <Toggle on={item.val} onChange={item.set}/>
              </div>
            ))}
          </GCard>
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Account</p>
          <GCard>
            {[
              { label: 'Data & Privacy', sub: 'How we use your data', red: false, action: onDataPrivacy },
              { label: 'Delete account', sub: 'Permanently remove your account', red: true, action: onDeleteAccount },
            ].map((item, idx, arr) => (
              <div key={item.label} onClick={item.action}
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.38)' : 'none', cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: item.red ? '#B03030' : '#2A1F18' }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: '#A09080', marginTop: 2 }}>{item.sub}</p>
                </div>
                <div style={{ width: 16, height: 16, color: '#C0B0A8' }}>{I.chevron}</div>
              </div>
            ))}
          </GCard>
        </div>

        <button className="btn-ghost" onClick={onSettings} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16 }}>{I.settings}</div> Settings
        </button>
      </div>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────
// ─── Subscription Plan Screen ─────────────────────────────────────────────────
function SubscriptionPlanScreen({ onSubscribe }: { onSubscribe: () => void }) {
  const features = [
    'Unlimited journeys',
    '5 safety buddies',
    'Smart anomaly detection on journeys',
    'Journey history',
  ]
  return (
    <div className="flex flex-col min-h-full" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,221,209,0.50) 0%, transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: 200, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,221,251,0.42) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 24px 24px', gap: 24, position: 'relative', zIndex: 1, overflowY: 'auto' }} className="no-scrollbar">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.48)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.70)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <div style={{ width: 24, height: 24, color: '#3D6B4F' }}>{I.shield}</div>
          </div>
          <h1 className="font-display" style={{ fontSize: 34, color: '#2A1F18', lineHeight: 1.15, marginBottom: 6 }}>SafeJourney</h1>
          <p style={{ fontSize: 14, color: '#7A6860', lineHeight: 1.6 }}>Stay safe.</p>
        </div>

        <GCard className="p-5">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span className="font-display" style={{ fontSize: 36, color: '#2A1F18', letterSpacing: '-0.02em' }}>4,99 €</span>
            <span style={{ fontSize: 13, color: '#A09080' }}>/ month</span>
          </div>
          <p style={{ fontSize: 12, color: '#8A7870', marginBottom: 16 }}>Monthly subscription · Cancel anytime</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #5DBB7A, #3A9A5C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, color: '#fff' }}>{I.check}</div>
                </div>
                <span style={{ fontSize: 13, color: '#2A1F18' }}>{f}</span>
              </div>
            ))}
          </div>
        </GCard>

        <GCard tint="blue" className="p-4">
          <p style={{ fontSize: 12, color: '#1A3A6A', lineHeight: 1.55 }}>Your subscription keeps SafeJourney running so you and your buddies can journey with peace of mind.</p>
        </GCard>
      </div>

      <div style={{ padding: '12px 24px 48px', position: 'relative', zIndex: 1 }}>
        <button className="btn-blue" onClick={onSubscribe}>Subscribe — 4,99 € / month</button>
      </div>
    </div>
  )
}

// ─── Payment Method Screen ────────────────────────────────────────────────────
function PaymentMethodScreen({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [method, setMethod] = useState<'card' | 'paypal'>('card')
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const formatCardNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d
  }

  const cardValid = cardName.trim() && cardNumber.replace(/\s/g,'').length === 16 && cardExpiry.length === 5 && cardCvv.length >= 3
  const canPay = method === 'paypal' || cardValid

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 16, fontSize: 14, fontFamily: 'Outfit,sans-serif', color: '#2A1F18',
    background: 'rgba(255,255,255,0.42)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.62)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Payment" onBack={onBack}/>
      <div style={{ flex: 1, minHeight: 0, padding: '4px 16px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="no-scrollbar">

        {/* Order summary */}
        <GCard tint="blue" className="px-4 py-3 flex items-center justify-between">
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6A' }}>SafeJourney Monthly</p>
            <p style={{ fontSize: 11, color: '#3A6A9A', marginTop: 2 }}>Billed monthly · Cancel anytime</p>
          </div>
          <span className="font-display" style={{ fontSize: 20, color: '#1A3A6A', letterSpacing: '-0.01em' }}>4,99 €</span>
        </GCard>

        {/* Method selector */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Payment method</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['card', 'paypal'] as const).map(m => (
              <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '12px', borderRadius: 16, fontSize: 13, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'all 0.15s', ...(method === m ? { background: 'rgba(200,221,251,0.60)', color: '#0A1A3A', border: '1.5px solid rgba(160,200,255,0.65)', backdropFilter: 'blur(14px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.62)' } : { background: 'rgba(255,255,255,0.30)', color: '#5A4A40', border: '1px solid rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)' }) }}>
                {m === 'card' ? '💳 Debit Card' : '🅿️ PayPal'}
              </button>
            ))}
          </div>
        </div>

        {/* Card form */}
        {method === 'card' && (
          <GCard className="p-4"><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Cardholder name</p>
              <input style={inputStyle} type="text" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)}/>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Card number</p>
              <input style={inputStyle} type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} inputMode="numeric"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Expiry</p>
                <input style={inputStyle} type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} inputMode="numeric"/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#8A7870', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>CVV</p>
                <input style={inputStyle} type="text" placeholder="•••" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric"/>
              </div>
            </div>
          </div></GCard>
        )}

        {/* PayPal option */}
        {method === 'paypal' && (
          <GCard className="p-5"><div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,70,180,0.10)', border: '1px solid rgba(0,70,180,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24 }}>🅿️</span>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#2A1F18', marginBottom: 4 }}>Pay with PayPal</p>
              <p style={{ fontSize: 12, color: '#7A6860', lineHeight: 1.55 }}>You'll be redirected to PayPal to authorise your subscription of 4,99 € / month.</p>
            </div>
          </div></GCard>
        )}

        <GCard tint="blue" className="p-4 flex gap-3">
          <div style={{ width: 14, height: 14, color: '#1A4A7A', flexShrink: 0, marginTop: 2 }}>{I.lock}</div>
          <p style={{ fontSize: 12, color: '#2A5A9A', lineHeight: 1.55 }}>Your payment is processed securely. SafeJourney never stores your card details.</p>
        </GCard>
      </div>

      <div style={{ padding: '12px 16px 36px' }}>
        <button className="btn-blue" disabled={!canPay} onClick={onComplete}>
          {method === 'paypal' ? 'Continue to PayPal' : 'Pay 4,99 € and subscribe'}
        </button>
      </div>
    </div>
  )
}

// ─── Subscription Settings Screen ─────────────────────────────────────────────
function SubscriptionSettingsScreen({ onBack, isSubscribed, onCancelConfirm }: {
  onBack: () => void
  isSubscribed: boolean
  onCancelConfirm: () => void
}) {
  const [showCancel, setShowCancel] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Subscription" onBack={onBack}/>
      <div style={{ flex: 1, minHeight: 0, padding: '4px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="no-scrollbar pb-6">

        {/* Status */}
        <GCard tint={isSubscribed ? 'green' : undefined} className="p-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: isSubscribed ? 'rgba(61,122,80,0.15)' : 'rgba(180,160,150,0.15)', border: `1px solid ${isSubscribed ? 'rgba(61,122,80,0.30)' : 'rgba(180,160,150,0.30)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, color: isSubscribed ? '#3D7A50' : '#A09080' }}>{I.shield}</div>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#2A1F18' }}>SafeJourney Monthly</p>
              <p style={{ fontSize: 12, color: isSubscribed ? '#3D7A50' : '#A09080', marginTop: 2 }}>
                {isSubscribed ? '● Active' : '○ Cancelled'}
              </p>
            </div>
          </div>
        </GCard>

        {/* Plan details */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Plan details</p>
          <GCard>
            {[
              ['Price', '4,99 € / month'],
              ['Billing', 'Monthly'],
              ['Journeys', 'Unlimited'],
              ['Safety buddies', '5'],
            ].map(([label, value], idx, arr) => (
              <div key={label} style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.38)' : 'none' }}>
                <p style={{ fontSize: 13, color: '#7A6860' }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#2A1F18' }}>{value}</p>
              </div>
            ))}
          </GCard>
        </div>

        {isSubscribed && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Manage</p>
            <GCard>
              <div onClick={() => setShowCancel(true)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#C43A3A' }}>Cancel subscription</p>
                <div style={{ width: 16, height: 16, color: '#C0B0A8' }}>{I.chevron}</div>
              </div>
            </GCard>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(30,20,16,0.52)', backdropFilter: 'blur(8px)' }}>
          <GCard className="p-6 w-full">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(180,40,40,0.12)', border: '1px solid rgba(180,40,40,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <div style={{ width: 20, height: 20, color: '#B03030' }}>{I.warning}</div>
              </div>
              <h2 className="font-display" style={{ fontSize: 20, color: '#2A1F18', marginBottom: 8 }}>Cancel subscription?</h2>
              <p style={{ fontSize: 13, color: '#2A1F18', lineHeight: 1.6 }}>Cancelling will end your access to SafeJourney at the end of the current billing period. You will be logged out immediately.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-danger" onClick={onCancelConfirm}>Confirm cancellation</button>
              <button className="btn-ghost" onClick={() => setShowCancel(false)}>Keep subscription</button>
            </div>
          </GCard>
        </div>
      )}
    </div>
  )
}

function Settings({ onBack, onHelpSupport, defaultDuration, onDefaultDuration, onAbout, defaultDurationMode, onSubscription }: {
  onBack: () => void
  onHelpSupport: () => void
  defaultDuration: { hours: number; minutes: number }
  onDefaultDuration: () => void
  onAbout: () => void
  defaultDurationMode: 'maps' | 'fixed'
  onSubscription: () => void
}) {
  const [notif, setNotif] = useState(true)
  const [circle, setCircle] = useState(true)
  const durationLabel = defaultDurationMode === 'maps'
    ? 'Estimated by maps'
    : defaultDuration.hours > 0
      ? `${defaultDuration.hours}h ${defaultDuration.minutes}min`
      : `${defaultDuration.minutes} min`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Settings" onBack={onBack}/>
      <div style={{ flex: 1, padding: '4px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="no-scrollbar pb-6">
        {/* Notifications */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Notifications</p>
          <GCard>
            {[
              { label: 'Journey notifications', toggle: true, val: notif, set: setNotif },
              { label: 'Safety Circle alerts', toggle: true, val: circle, set: setCircle },
            ].map((item: any, idx, arr) => (
              <div key={item.label} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.38)' : 'none' }}>
                <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#2A1F18' }}>{item.label}</p>
                <Toggle on={item.val} onChange={item.set}/>
              </div>
            ))}
          </GCard>
        </div>

        {/* Journey Defaults */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Journey defaults</p>
          <GCard>
            <div onClick={onDefaultDuration} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#2A1F18' }}>Default duration</p>
                <p style={{ fontSize: 11, color: '#A09080', marginTop: 2 }}>{durationLabel}</p>
              </div>
              <div style={{ width: 16, height: 16, color: '#C0B0A8' }}>{I.chevron}</div>
            </div>
          </GCard>
        </div>

        {/* Permissions */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Permissions</p>
          <GCard>
            {[['Location access','Always'],['Notifications','Enabled']].map(([label,sub], idx, arr) => (
              <div key={label} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.38)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#2A1F18' }}>{label}</p>
                  <p style={{ fontSize: 11, color: '#A09080', marginTop: 2 }}>{sub}</p>
                </div>
                <div style={{ width: 16, height: 16, color: '#C0B0A8' }}>{I.chevron}</div>
              </div>
            ))}
          </GCard>
        </div>

        {/* Subscription */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Subscription</p>
          <GCard>
            <div onClick={onSubscription} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#2A1F18' }}>Subscription</p>
                <p style={{ fontSize: 11, color: '#A09080', marginTop: 2 }}>Monthly · 4,99 €</p>
              </div>
              <div style={{ width: 16, height: 16, color: '#C0B0A8' }}>{I.chevron}</div>
            </div>
          </GCard>
        </div>

        {/* Support */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A09080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Support</p>
          <GCard>
            {[
              { label: 'Help & Support', action: onHelpSupport },
              { label: 'About SafeJourney', action: onAbout },
            ].map((item, idx, arr) => (
              <div key={item.label} onClick={item.action} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.38)' : 'none', cursor: 'pointer' }}>
                <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#2A1F18' }}>{item.label}</p>
                <div style={{ width: 16, height: 16, color: '#C0B0A8' }}>{I.chevron}</div>
              </div>
            ))}
          </GCard>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(30,20,16,0.52)', backdropFilter: 'blur(8px)' }}>
      <GCard className="p-6 w-full">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(180,40,40,0.12)', border: '1px solid rgba(180,40,40,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <div style={{ width: 20, height: 20, color: '#B03030' }}>{I.warning}</div>
          </div>
          <h2 className="font-display" style={{ fontSize: 20, color: '#2A1F18', marginBottom: 8 }}>Delete your account?</h2>
          <p style={{ fontSize: 13, color: '#2A1F18', lineHeight: 1.6 }}>Do you want to permanently delete your account? This action cannot be undone.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-danger" onClick={onConfirm}>Confirm</button>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </GCard>
    </div>
  )
}

// ─── Duration Modal ───────────────────────────────────────────────────────────
function DurationModal({ current, currentMode, onConfirm, onCancel }: {
  current: { hours: number; minutes: number }
  currentMode: 'maps' | 'fixed'
  onConfirm: (d: { hours: number; minutes: number; mode: 'maps' | 'fixed' }) => void
  onCancel: () => void
}) {
  const [hours, setHours] = useState(current.hours)
  const [minutes, setMinutes] = useState(current.minutes)
  const [mode, setMode] = useState<'maps' | 'fixed'>(currentMode)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 14, fontSize: 20, fontFamily: 'Outfit,sans-serif', color: '#2A1F18', fontWeight: 600, textAlign: 'center',
    background: 'rgba(255,255,255,0.50)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.65)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)', outline: 'none',
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(30,20,16,0.45)', backdropFilter: 'blur(8px)' }}>
      <GCard className="p-6 w-full">
        <h2 className="font-display" style={{ fontSize: 22, color: '#2A1F18', marginBottom: 16, textAlign: 'center' }}>Default duration</h2>
        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['maps', 'fixed'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '10px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'all 0.15s', ...(mode === m ? { background: 'rgba(200,221,251,0.70)', color: '#0A1A3A', border: '1px solid rgba(200,221,251,0.70)' } : { background: 'rgba(255,255,255,0.28)', color: '#6A5848', border: '1px solid rgba(255,255,255,0.48)' }) }}>
              {m === 'maps' ? 'Estimated by maps' : 'Fixed duration'}
            </button>
          ))}
        </div>
        {mode === 'maps' ? (
          <p style={{ fontSize: 13, color: '#2A1F18', lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>Duration estimated from route and travel mode</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#2A1F18', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, textAlign: 'center' }}>Hours</p>
              <input style={inputStyle} type="number" min={0} max={23} value={hours} onChange={e => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}/>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#2A1F18', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, textAlign: 'center' }}>Minutes</p>
              <input style={inputStyle} type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}/>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-blue" onClick={() => onConfirm({ hours, minutes, mode })}>Confirm</button>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </GCard>
    </div>
  )
}

// ─── Journey state picker (demo control) ─────────────────────────────────────
function JourneyStatePicker({ cur, set }: { cur: JState; set: (s: JState) => void }) {
  const opts: { key: JState; label: string }[] = [
    { key: 'normal',             label: '🟢 Normal' },
    { key: 'unusual-stationary', label: '🟡 Stop' },
    { key: 'unusual-offroute',   label: '🔴 Off route' },
    { key: 'concern-fall',       label: '🔴 Fall' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.28)', overflowX: 'auto' }} className="no-scrollbar">
      {opts.map(o => (
        <button key={o.key} onClick={() => set(o.key)}
          style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 12, fontSize: 11, fontWeight: 500, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'all 0.15s', ...(cur === o.key ? { background: 'rgba(255,255,255,0.85)', color: '#2A1F18', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.70)' } : { background: 'transparent', color: '#5A4A40', border: 'none' }) }}>{o.label}</button>
      ))}
    </div>
  )
}

// ─── Notification Demo Panel ──────────────────────────────────────────────────
function NotifDemoPanel({ onClose, onTap }: {
  userName: string
  onClose: () => void
  onTap: (buddyJState: 'normal' | 'stopped' | 'offroute' | 'fall') => void
}) {
  const runnerName = 'Mika'
  const tiles: { state: 'normal' | 'stopped' | 'offroute' | 'fall'; title: string; body: string }[] = [
    { state: 'offroute', title: `⚠️ ${runnerName} is off route`, body: `${runnerName} has moved outside the planned route.` },
    { state: 'stopped',  title: `⚠️ ${runnerName} has stopped`, body: `${runnerName} hasn't moved for 8 minutes.` },
    { state: 'fall',     title: '🚨 Possible fall detected', body: `A possible fall was detected during ${runnerName}'s journey.` },
  ]
  return (
    <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 200, width: 340, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.50)', fontStyle: 'italic' }}>~ Approximate platform notification examples</p>
        <button onClick={onClose} style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>✕</button>
      </div>
      {tiles.map(t => (
        <button key={t.state} onClick={() => onTap(t.state)}
          style={{ width: '100%', textAlign: 'left', borderRadius: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.80)', boxShadow: '0 4px 20px rgba(0,0,0,0.24)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1410', marginBottom: 2 }}>{t.title}</p>
          <p style={{ fontSize: 12, color: '#4A3830', lineHeight: 1.4 }}>{t.body}</p>
        </button>
      ))}
    </div>
  )
}

// ─── Screen picker (demo control) ────────────────────────────────────────────
function ScreenPicker({ cur, onPick }: { cur: Screen; onPick: (s: Screen) => void }) {
  const [open, setOpen] = useState(false)
  const items: { key: Screen; label: string }[] = [
    { key: 'home',                 label: 'Home' },
    { key: 'create-journey',       label: 'Plan Journey (map)' },
    { key: 'safety-buddy',         label: 'Safety Buddy' },
    { key: 'journey-review',       label: 'Journey Review' },
    { key: 'active-journey',       label: 'Active Journey' },
    { key: 'arrival',              label: 'Safe Arrival' },
    { key: 'buddy-webview',        label: 'Buddy Web View' },
    { key: 'buddy-alert',          label: 'Buddy Alert' },
    { key: 'buddy-alert-tracking', label: 'Buddy Alert Tracking' },
    { key: 'tracking',             label: 'Tracking (buddy)' },
    { key: 'safety-circle',        label: 'Safety Circle' },
    { key: 'history',              label: 'Your Journeys' },
    { key: 'profile',              label: 'Profile & Privacy' },
    { key: 'settings',             label: 'Settings' },
    { key: 'data-privacy',         label: 'Data & Privacy' },
    { key: 'help-support',         label: 'Help & Support' },
    { key: 'about',                label: 'About SafeJourney' },
    { key: 'add-contact',          label: 'Add Trusted Contact' },
    { key: 'account-setup',        label: 'Account Setup' },
    { key: 'subscription-plan',    label: 'Subscription Plan' },
    { key: 'payment-method',       label: 'Payment Method' },
    { key: 'subscription-settings',label: 'Subscription Settings' },
  ]
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', padding: '6px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.20)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
        Screens <div style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.60)' }}>{I.chevron}</div>
      </button>
      {open && (
        <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 8, width: 240, maxHeight: 360, overflowY: 'auto', borderRadius: 20, background: 'rgba(255,255,255,0.76)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.72)', boxShadow: '0 16px 48px rgba(80,50,30,0.18)' }} className="no-scrollbar">
          {items.map(s => (
            <button key={s.key} onClick={() => { onPick(s.key); setOpen(false) }}
              style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 12, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'background 0.1s', background: cur === s.key ? 'rgba(120,195,150,0.22)' : 'transparent', color: cur === s.key ? '#1E5E35' : '#4A3830', fontWeight: cur === s.key ? 600 : 400, border: 'none' }}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function jStateToStatus(j: JState): 'normal' | 'stopped' | 'offroute' | 'fall' {
  if (j === 'unusual-stationary') return 'stopped'
  if (j === 'unusual-offroute') return 'offroute'
  if (j === 'concern-fall') return 'fall'
  return 'normal'
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [onboarding, setOnboarding] = useState(true)
  const [screen, setScreen] = useState<Screen>('home')
  const [tab, setTab] = useState<NavTab>('home')
  const [jState, setJState] = useState<JState>('normal')

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [buddy, setBuddy] = useState('Ana')

  // User account
  const [hasAccount, setHasAccount] = useState(false)
  const [accountDraft, setAccountDraft] = useState({ name: '', email: '', phone: '' })
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [userName, setUserName] = useState('Petra')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([
    { name: 'Ana', phone: '', role: 'Best friend' },
    { name: 'Sara', phone: '', role: 'Sister' },
    { name: 'Marko', phone: '', role: 'Partner' },
  ])
  const [addContactReturn, setAddContactReturn] = useState<Screen>('safety-buddy')
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null)

  // Journey active (for tracking tab)
  const [journeyActive, setJourneyActive] = useState(false)
  const [buddyJState, setBuddyJState] = useState<'normal' | 'stopped' | 'offroute' | 'fall'>('normal')

  // Completed journeys
  const [completedJourneys, setCompletedJourneys] = useState<CompletedJourney[]>([
    { id: 0, name: 'Morning Run', activityType: 'run', distanceKm: 6.1, durationMin: 42, completedAt: new Date('2024-08-10'), status: 'offroute' }
  ])
  const [journeyEndStatus, setJourneyEndStatus] = useState<'normal' | 'stopped' | 'offroute' | 'fall'>('normal')

  // Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDurationModal, setShowDurationModal] = useState(false)
  const [defaultDuration, setDefaultDuration] = useState({ hours: 0, minutes: 35 })
  const [defaultDurationMode, setDefaultDurationMode] = useState<'maps' | 'fixed'>('maps')
  const [showNotifDemo, setShowNotifDemo] = useState(false)

  // Navigation from data-privacy
  const [dataPrivacyFrom, setDataPrivacyFrom] = useState<Screen>('profile')

  const go = (s: Screen) => {
    setScreen(s)
    const tabMap: Partial<Record<Screen, NavTab>> = {
      home: 'home',
      'create-journey': 'tracking', 'safety-buddy': 'tracking',
      'journey-review': 'tracking', 'active-journey': 'tracking',
      tracking: 'tracking', 'buddy-alert-tracking': 'tracking',
      'safety-circle': 'circle',
      history: 'activity', 'your-journeys': 'activity',
      profile: 'profile', settings: 'profile', about: 'profile',
    }
    if (tabMap[s]) setTab(tabMap[s]!)
  }

  const goTab = (t: NavTab) => {
    setTab(t)
    const m: Record<NavTab, Screen> = {
      home: 'home', tracking: 'tracking', circle: 'safety-circle', activity: 'history', profile: 'profile',
    }
    setScreen(m[t])
  }

  const pickScreen = (s: Screen) => {
    if (s === 'active-journey') { setScreen('active-journey'); setJState('normal'); setTab('tracking') }
    else if (s === 'account-setup') { setOnboarding(false); setScreen('account-setup') }
    else go(s)
  }

  const addJourney = () => {
    const newJourney: CompletedJourney = {
      id: Date.now(),
      name: routeInfo?.name ?? 'Run',
      activityType: routeInfo?.activityType ?? 'run',
      distanceKm: routeInfo?.distance ?? 5.2,
      durationMin: routeInfo?.estimatedMinutes ?? 34,
      completedAt: new Date(),
      status: journeyEndStatus,
    }
    setCompletedJourneys(prev => [newJourney, ...prev])
  }

  const handleAddContact = (c: Contact) => {
    if (editContactIndex !== null) {
      setContacts(prev => prev.map((existing, i) => i === editContactIndex ? c : existing))
      setEditContactIndex(null)
    } else {
      setContacts(prev => [...prev, c])
    }
    go(addContactReturn)
  }

  const showNav = !['create-journey','safety-buddy','journey-review','active-journey','arrival',
    'buddy-webview','buddy-alert','buddy-alert-tracking','add-contact','account-setup',
    'data-privacy','help-support','about',
    'subscription-plan','payment-method','subscription-settings'].includes(screen) && !onboarding

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px 16px', background: 'linear-gradient(160deg, #1A1410 0%, #0E0E12 100%)' }}>

      {/* Phone frame */}
      <div className="app-bg" style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: 390, height: 844, borderRadius: 52, boxShadow: '0 0 0 12px #1C1917, 0 60px 120px rgba(0,0,0,0.70)' }}>

        {/* Background orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,221,209,0.50) 0%, transparent 70%)' }}/>
          <div style={{ position: 'absolute', top: 160, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,221,251,0.42) 0%, transparent 70%)' }}/>
          <div style={{ position: 'absolute', bottom: 80, left: 20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,221,251,0.30) 0%, transparent 70%)' }}/>
          <div style={{ position: 'absolute', bottom: 200, right: 0, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,221,209,0.28) 0%, transparent 70%)' }}/>
        </div>

        {/* Status bar */}
        <div style={{ position: 'relative', zIndex: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px 6px', height: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#2A1F18' }}>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 500, color: '#4A3830' }}>
            <span>●●●</span><span>WiFi</span><span>■</span>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          {onboarding ? (
            <Onboarding
              hasAccount={hasAccount}
              onComplete={() => { setOnboarding(false); setScreen('account-setup') }}
              onSkip={() => setOnboarding(false)}
            />
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {screen === 'account-setup' && (
                  <AccountSetup
                    onConfirm={async (name, email, phone, password) => {
                      const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                          data: {
                            full_name: name,
                            phone,
                          },
                        },
                      })

                      if (error) {
                        console.error('Supabase signup error:', error)
                        return
                      }

                      setUserName(name || 'Petra')
                      setUserEmail(email)
                      setUserPhone(phone)
                      setHasAccount(true)

                      if (data.user) {
                        go('subscription-plan')
                      }
                    }}
                    onDataPrivacy={() => { setDataPrivacyFrom('account-setup'); go('data-privacy') }}
                    initialValues={accountDraft}
                    onValuesChange={setAccountDraft}
                  />
                )}
                {screen === 'home' && (
                  <HomeScreen onNav={go} routeInfo={routeInfo} userName={userName} completedJourneys={completedJourneys}/>
                )}
                {screen === 'create-journey' && (
                  <CreateJourney
                    onConfirm={(info) => { setRouteInfo(info); go('safety-buddy') }}
                    onBack={() => go('home')}
                  />
                )}
                {screen === 'safety-buddy' && (
                  <SafetyBuddy
                    contacts={contacts}
                    onNext={(b) => { setBuddy(b); go('journey-review') }}
                    onBack={() => go('create-journey')}
                    onAddContact={() => { setAddContactReturn('safety-buddy'); go('add-contact') }}
                  />
                )}
                {screen === 'add-contact' && (
                  <AddTrustedContact
                    onConfirm={handleAddContact}
                    onBack={() => { setEditContactIndex(null); go(addContactReturn) }}
                    initialData={editContactIndex !== null ? contacts[editContactIndex] : undefined}
                    title={editContactIndex !== null ? 'Edit contact' : 'Add trusted contact'}
                  />
                )}
                {screen === 'journey-review' && (
                  <JourneyReview
                    routeInfo={routeInfo} buddy={buddy}
                    onStart={() => { go('active-journey'); setJState('normal'); setJourneyActive(true) }}
                    onBack={() => go('safety-buddy')}
                  />
                )}
                {screen === 'active-journey' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <JourneyStatePicker cur={jState} set={setJState}/>
                    <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                      <ActiveJourney
                        state={jState} routeInfo={routeInfo} buddy={buddy}
                        onNav={s => {
                          if (s === 'active-journey') { setJState('normal') }
                          else if (s === 'arrival') {
                            const status = jStateToStatus(jState)
                            setJourneyEndStatus(status)
                            go('arrival')
                          } else { go(s) }
                        }}
                      />
                    </div>
                  </div>
                )}
                {screen === 'arrival' && (
                  <Arrival
                    routeInfo={routeInfo} buddy={buddy}
                    onDone={() => { addJourney(); go('home'); setRouteInfo(null); setJourneyActive(false) }}
                    onViewJourneys={() => { addJourney(); go('history'); setJourneyActive(false) }}
                  />
                )}
                {screen === 'buddy-webview' && (
                  <BuddyWebView routeInfo={routeInfo} buddy={buddy} onBack={() => go('home')} userName={userName}/>
                )}
                {screen === 'buddy-alert' && (
                  <BuddyAlert routeInfo={routeInfo} onBack={() => go('home')} userName={userName}/>
                )}
                {screen === 'buddy-alert-tracking' && (
                  <BuddyAlertTracking routeInfo={routeInfo} alertType="offroute" onBack={() => go('tracking')} userName={userName}/>
                )}
                {screen === 'tracking' && (
                  <TrackingScreen
                    journeyActive={journeyActive}
                    routeInfo={routeInfo}
                    userName={userName}
                    buddyJState={buddyJState}
                    setBuddyJState={setBuddyJState}
                  />
                )}
                {screen === 'safety-circle' && (
                  <SafetyCircle
                    contacts={contacts}
                    onBack={() => go('home')}
                    onAddPerson={() => { setAddContactReturn('safety-circle'); setEditContactIndex(null); go('add-contact') }}
                    onEdit={(index) => { setEditContactIndex(index); setAddContactReturn('safety-circle'); go('add-contact') }}
                    onRemove={(index) => { setContacts(prev => prev.filter((_, i) => i !== index)) }}
                  />
                )}
                {(screen === 'history' || screen === 'your-journeys') && (
                  <History onBack={() => go('home')} completedJourneys={completedJourneys}/>
                )}
                {screen === 'profile' && (
                  <Profile
                    onBack={() => go('home')} onSettings={() => go('settings')}
                    userName={userName} userEmail={userEmail}
                    onDataPrivacy={() => { setDataPrivacyFrom('profile'); go('data-privacy') }}
                    onDeleteAccount={() => setShowDeleteConfirm(true)}
                  />
                )}
                {screen === 'settings' && (
                  <Settings
                    onBack={() => go('profile')}
                    onHelpSupport={() => go('help-support')}
                    defaultDuration={defaultDuration}
                    onDefaultDuration={() => setShowDurationModal(true)}
                    onAbout={() => go('about')}
                    defaultDurationMode={defaultDurationMode}
                    onSubscription={() => go('subscription-settings')}
                  />
                )}
                {screen === 'data-privacy' && <DataPrivacy onBack={() => go(dataPrivacyFrom)}/>}
                {screen === 'help-support' && <HelpSupport onBack={() => go('settings')}/>}
                {screen === 'about' && <AboutSafeJourney onBack={() => go('settings')}/>}
                {screen === 'subscription-plan' && (
                  <SubscriptionPlanScreen onSubscribe={() => go('payment-method')}/>
                )}
                {screen === 'payment-method' && (
                  <PaymentMethodScreen
                    onComplete={() => { setIsSubscribed(true); go('home') }}
                    onBack={() => go('subscription-plan')}
                  />
                )}
                {screen === 'subscription-settings' && (
                  <SubscriptionSettingsScreen
                    onBack={() => go('settings')}
                    isSubscribed={isSubscribed}
                    onCancelConfirm={() => {
                      setIsSubscribed(false)
                      setHasAccount(false)
                      setOnboarding(true)
                      setScreen('home')
                      setAccountDraft({ name: '', email: '', phone: '' })
                    }}
                  />
                )}
              </div>
              {showNav && <BottomNav active={tab} onNav={goTab}/>}
            </>
          )}
        </div>

        {/* Home indicator */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 112, height: 4, borderRadius: 999, background: 'rgba(42,31,24,0.16)', zIndex: 20, pointerEvents: 'none' }}/>

        {/* Modals */}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            onConfirm={() => { setShowDeleteConfirm(false); setOnboarding(true); setScreen('home'); setUserName('Petra'); setUserEmail(''); setUserPhone(''); setHasAccount(false); setAccountDraft({ name: '', email: '', phone: '' }) }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
        {showDurationModal && (
          <DurationModal
            current={defaultDuration}
            currentMode={defaultDurationMode}
            onConfirm={(d) => { setDefaultDuration({ hours: d.hours, minutes: d.minutes }); setDefaultDurationMode(d.mode); setShowDurationModal(false) }}
            onCancel={() => setShowDurationModal(false)}
          />
        )}

        {/* Notif demo panel */}
        {showNotifDemo && (
          <NotifDemoPanel
            userName={userName}
            onClose={() => setShowNotifDemo(false)}
            onTap={(state) => {
              setJourneyActive(true)
              setBuddyJState(state)
              go('tracking')
              setShowNotifDemo(false)
            }}
          />
        )}

        {/* Demo controls — inside the phone frame so buttons are tappable in preview */}
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 20, background: 'rgba(14,10,8,0.80)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.10)', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 600, letterSpacing: '0.04em' }}>SAFEJOURNEY</span>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }}/>
          {!onboarding && (
            <button onClick={() => { setOnboarding(true); setScreen('home') }}
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
              Onboarding
            </button>
          )}
          <button onClick={() => setJourneyActive(j => !j)}
            style={{ fontSize: 11, color: journeyActive ? 'rgba(93,187,122,0.90)' : 'rgba(255,255,255,0.50)', padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
            {journeyActive ? '🟢 Journey active' : 'Journey off'}
          </button>
          <button onClick={() => setShowNotifDemo(v => !v)}
            style={{ fontSize: 11, color: showNotifDemo ? 'rgba(249,221,209,0.90)' : 'rgba(255,255,255,0.50)', padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
            🔔
          </button>
          <ScreenPicker cur={screen} onPick={pickScreen}/>
        </div>
      </div>
    </div>
  )
}
