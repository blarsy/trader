import { useState, useEffect } from 'react'
import Connect from './components/connect'
import Dashboard from './components/Dashboard'
import { useAppContext } from '../lib/appState'

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [appState] = useAppContext()
  useEffect(() => {
    if(!loaded && appState.sessionId) {
      setLoaded(!!appState.sessionId)
    }
  })
  
  return (
    <main>
      {loaded ? <Dashboard/> : <Connect/> }
    </main>
  )
}
