import Connect from './components/connect'
import Dashboard from './components/Dashboard'

export default function Home() {
  isConnected = localStorage.getItem('walletAddress')
  return (
    <main>
      {!isConnected && <Connect/> }
      {isConnected && <Dashboard/> }
    </main>
  )
}
