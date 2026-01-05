import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import axios from 'axios'
import Navbar from './Navbar'
import Input from './input'
import History from './History'
import Environment from './Environment'
import PresetSidebar from './PresetSidebar'

function AppContent() {
  const location = useLocation()
  const showSidebar = location.pathname === '/'
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [activeEnvironment, setActiveEnvironment] = useState(null)

  // Fetch active environment on mount and when location changes
  useEffect(() => {
    fetchActiveEnvironment()
  }, [location.pathname])

  const fetchActiveEnvironment = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/environments/active')
      setActiveEnvironment(response.data)
    } catch (err) {
      console.error('Failed to fetch active environment:', err)
    }
  }

  const handlePresetsLoaded = (presets) => {
    // Auto-load the first (latest) preset if none is selected yet and we have presets
    if (!selectedPreset && presets && presets.length > 0) {
      setSelectedPreset(presets[0])
    }
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.mainLayout}>
        {showSidebar && (
          <PresetSidebar
            onSelectPreset={setSelectedPreset}
            onPresetsLoaded={handlePresetsLoaded}
          />
        )}
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={
              <Input
                selectedPreset={selectedPreset}
                activeEnvironment={activeEnvironment}
              />
            } />
            <Route path="/environment" element={<Environment />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  content: {
    flex: 1,
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: 0, // Prevent flex item overflow
  },
}

export default App
