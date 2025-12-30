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
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    color: 'inherit',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  navLink: {
    textDecoration: 'none',
    color: '#666',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    color: '#007bff',
    backgroundColor: '#f0f7ff',
  },
  logo: {
    height: '50px',
    width: 'auto',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
}

export default Navbar

