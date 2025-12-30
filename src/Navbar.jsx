import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import capexpress from '../capexpress.png'

function Navbar() {
  const location = useLocation()

  return (
    <nav style={styles.navbar}>
      <div style={styles.content}>
        <Link to="/" style={styles.logoLink}>
          <img src={capexpress} alt="Cappuchino Express" style={styles.logo} />
          <h1 style={styles.title}>Cappuchino Express</h1>
        </Link>
        <div style={styles.navLinks}>
          <Link
            to="/"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/' ? styles.activeLink : {})
            }}
          >
            API Client
          </Link>
          <Link
            to="/history"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/history' ? styles.activeLink : {})
            }}
          >
            History
          </Link>
        </div>
      </div>
    </nav>
  )
}

const styles = {
  navbar: {
    backgroundColor: 'var(--surface-color)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1rem 2rem',
    boxShadow: '0 4px 6px rgba(62, 39, 35, 0.1)', // Warm shadow
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textDecoration: 'none',
    color: 'var(--text-primary)',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  navLink: {
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    color: 'var(--accent-color)',
    backgroundColor: 'var(--bg-secondary)',
    fontWeight: '600',
  },
  logo: {
    height: '50px',
    width: 'auto',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    fontFamily: "'Georgia', serif", // More "coffee shop" feel
  },
}

export default Navbar

