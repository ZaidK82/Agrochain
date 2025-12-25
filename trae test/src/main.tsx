import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Yield from './pages/Yield'
import Price from './pages/Price'
import Resilience from './pages/Resilience'
import Marketplace from './pages/Marketplace'
import Traceability from './pages/Traceability'
import Wallet from './pages/Wallet'
import './i18n'
import { WalletProvider } from './wallet/WalletContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/yield" element={<Yield />} />
              <Route path="/price" element={<Price />} />
              <Route path="/resilience" element={<Resilience />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/traceability" element={<Traceability />} />
              <Route path="/wallet" element={<Wallet />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </QueryClientProvider>
  </StrictMode>,
)
