const steps = [
  { title: 'Planting', hash: '0xabc123' },
  { title: 'Harvest', hash: '0xdef456' },
  { title: 'Storage', hash: '0x789abc' },
  { title: 'Sale', hash: '0x123def' },
]

function Traceability() {
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <div className="text-lg font-medium mb-4">Traceability</div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-1 bg-accent rounded"></div>
        <div className="space-y-6">
          {steps.map((s, idx) => (
            <div key={idx} className="pl-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent"></div>
                <div className="font-medium">{s.title}</div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="px-2 py-1 rounded bg-neutral/10">{s.hash}</div>
                <button className="px-3 py-2 rounded border">Copy Hash</button>
                <button className="px-3 py-2 rounded border">Open in Explorer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 w-48 h-48 bg-neutral/20 rounded"></div>
    </div>
  )
}

export default Traceability
