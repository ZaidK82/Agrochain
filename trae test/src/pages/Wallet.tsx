import { useWallet } from '../wallet/useWallet'

function Wallet() {
  const { address, connect, disconnect } = useWallet()
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <div className="text-lg font-medium mb-4">Wallet</div>
      <div className="flex items-center gap-3">
        {address ? (
          <>
            <div className="px-3 py-2 rounded bg-neutral/10">{address}</div>
            <button className="px-3 py-2 rounded border" onClick={disconnect}>Disconnect</button>
          </>
        ) : (
          <button className="px-3 py-2 rounded bg-primary text-white" onClick={connect}>Connect</button>
        )}
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 rounded bg-neutral/20" />
        <div className="h-32 rounded bg-neutral/20" />
        <div className="h-32 rounded bg-neutral/20" />
      </div>
      <div className="mt-6">
        <div className="text-sm text-neutral mb-2">Transactions</div>
        <div className="border rounded overflow-hidden">
          <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-neutral/10">
            <div>Date</div>
            <div>Action</div>
            <div>Token</div>
            <div>Status</div>
          </div>
          <div className="px-3 py-2">No data</div>
        </div>
      </div>
    </div>
  )
}

export default Wallet
