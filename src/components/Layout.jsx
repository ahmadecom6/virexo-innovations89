import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowUp, FiChevronRight, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi'
import PageTransition from './PageTransition'
import { ToastProvider } from './ToastContext'
import { useToast } from './useToast'
import VanillaInteractions from './VanillaInteractions'

const navItems = [['/', 'Home'], ['/services', 'Services'], ['/projects', 'Projects'], ['/about', 'About'], ['/technologies', 'Technologies'], ['/reviews', 'Reviews'], ['/faq', 'FAQ']]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => { const saved = window.localStorage.getItem('virexo-theme'); return saved ? saved !== 'light' : !window.matchMedia('(prefers-color-scheme: light)').matches })
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; window.localStorage.setItem('virexo-theme', dark ? 'dark' : 'light') }, [dark])
  return <header className="site-nav"><Link className="logo" to="/" onClick={() => setMenuOpen(false)}><span>V</span><strong>Virexo</strong><small>Innovations</small></Link><span className="live-systems-badge" data-live-systems><i /> LIVE SYSTEMS <time data-live-clock>00:00:00</time></span><button className="nav-menu-button icon-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <FiX /> : <FiMenu />}</button><nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">{navItems.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}<Link className="nav-consult" to="/contact" onClick={() => setMenuOpen(false)}>Start a project <FiArrowUp /></Link></nav><div className="nav-actions"><button className="theme-button icon-button" type="button" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} aria-pressed={dark} onClick={() => setDark((value) => !value)}>{dark ? <FiSun /> : <FiMoon />}</button><Link className="nav-login" to="/contact">Enquire</Link></div></header>
}

function CookieBanner() {
  const [visible, setVisible] = useState(() => !window.localStorage.getItem('virexo-cookie-choice'))
  if (!visible) return null
  return <aside className="cookie-banner" role="dialog" aria-label="Cookie preferences"><div><strong>Privacy, by design.</strong><p>We use essential storage to remember your preferences. No advertising cookies are used.</p></div><div className="cookie-actions"><button type="button" onClick={() => { window.localStorage.setItem('virexo-cookie-choice', 'essential'); setVisible(false) }}>Essential only</button><button className="button-small" type="button" onClick={() => { window.localStorage.setItem('virexo-cookie-choice', 'accepted'); setVisible(false) }}>Accept</button></div></aside>
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const notify = useToast()
  const submit = (event) => { event.preventDefault(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { notify('Please enter a valid email address.'); return } setEmail(''); notify('You are on the Virexo signal list.') }
  return <form className="newsletter" onSubmit={submit}><label htmlFor="newsletter-email">Occasional useful signals</label><div><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" aria-label="Email for newsletter" /><button type="submit" aria-label="Subscribe"><FiChevronRight /></button></div></form>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-top"><div><Link className="logo" to="/"><span>V</span><strong>Virexo</strong><small>Innovations</small></Link><p>Digital products, systems, and experiences for businesses ready to move with intention.</p></div><Newsletter /></div><div className="footer-bottom"><span>© 2026 Virexo Innovations</span><div><Link to="/services">Services</Link><Link to="/projects">Projects</Link><Link to="/contact">Contact</Link><Link to="/privacy-policy">Privacy Policy</Link><a href="https://github.com/ahmadecom6/virexo" target="_blank" rel="noreferrer">GitHub</a></div></div></footer>
}

function Breadcrumbs() {
  const location = useLocation()
  const path = location.pathname.split('/').filter(Boolean)
  if (path.length === 0) return null

  const labels = {
    services: 'Services',
    projects: 'Projects',
    about: 'About',
    technologies: 'Technologies',
    reviews: 'Reviews',
    faq: 'FAQ',
    contact: 'Contact',
    'privacy-policy': 'Privacy Policy',
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {path.map((segment, index) => {
        const currentPath = `/${path.slice(0, index + 1).join('/')}`
        const label = labels[segment] || segment.replace(/-/g, ' ')
        const isLast = index === path.length - 1

        return (
          <span key={currentPath}>
            <span className="crumb-separator">/</span>
            {isLast ? <span aria-current="page">{label}</span> : <Link to={currentPath}>{label}</Link>}
          </span>
        )
      })}
    </nav>
  )
}

function GlobalTools() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showTop, setShowTop] = useState(false)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [location.pathname])
  useEffect(() => { const onScroll = () => setShowTop(window.scrollY > 500); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll) }, [])
  return <><button className="floating-contact" type="button" onClick={() => navigate('/contact')} aria-label="Open contact page"><FiArrowUp /></button>{showTop && <button className="scroll-top icon-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top"><FiArrowUp /></button>}<CookieBanner /></>
}

function RoutedContent() {
  const location = useLocation()
  return <><a className="skip-link" href="#main-content">Skip to main content</a><div className="digital-top-banner" role="status"><div className="digital-top-banner__track"><span>◈ VIREXO DIGITAL SYSTEMS</span><span>BUILDING USEFUL TECHNOLOGY</span><span>DESIGN / ENGINEERING / AUTOMATION</span><span>◈ VIREXO DIGITAL SYSTEMS</span><span>BUILDING USEFUL TECHNOLOGY</span><span>DESIGN / ENGINEERING / AUTOMATION</span></div></div><Navbar /><Breadcrumbs /><main id="main-content" tabIndex="-1"><AnimatePresence mode="wait"><PageTransition key={location.pathname + location.search}><Outlet /></PageTransition></AnimatePresence></main><Footer /><GlobalTools /><VanillaInteractions /></>
}

export default function Layout() { return <ToastProvider><RoutedContent /></ToastProvider> }
