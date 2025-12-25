import { createContext, useMemo, useState } from 'react'
import { ethers, type Eip1193Provider } from 'ethers'

type WalletContextValue = {
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)

  async function connect() {
    const eth = (window as Window & typeof globalThis).ethereum as Eip1193Provider | undefined
    if (!eth) return
    const provider = new ethers.BrowserProvider(eth)
    const accounts = await provider.send('eth_requestAccounts', [])
    setAddress(accounts[0] || null)
  }

  function disconnect() {
    setAddress(null)
  }

  const value = useMemo(
    () => ({ address, connect, disconnect }),
    [address]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export { WalletContext }
