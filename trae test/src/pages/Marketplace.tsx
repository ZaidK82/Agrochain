const items = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  crop: ['Wheat', 'Rice', 'Maize'][i % 3],
  qty: `${10 + i} tons`,
  grade: ['A', 'B'][i % 2],
  resilience: ['High', 'Moderate'][i % 2],
}))

function Marketplace() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((x) => (
          <div key={x.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2">
            <div className="h-28 rounded bg-neutral/20" />
            <div className="font-medium">{x.crop}</div>
            <div className="text-sm text-neutral">{x.qty}</div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 rounded bg-secondary/10">{x.grade}</div>
              <div className="px-2 py-1 rounded bg-primary/10">{x.resilience}</div>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 px-3 py-2 rounded border">View Traceability</button>
              <button className="flex-1 px-3 py-2 rounded bg-primary text-white">Buy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Marketplace
