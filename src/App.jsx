import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Input from './input'
import History from './History'
import PresetSidebar from './PresetSidebar'

function AppContent() {
  const location = useLocation()
  const showSidebar = location.pathname === '/'
  const [selectedPreset, setSelectedPreset] = React.useState(null)

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
            <Route path="/" element={<Input selectedPreset={selectedPreset} />} />
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
