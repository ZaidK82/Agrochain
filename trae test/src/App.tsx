import { Outlet } from 'react-router-dom'
import TopNav from './components/TopNav'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 px-4 md:px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default App
