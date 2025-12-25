function Gauge({ value }: { value: number }) {
  const angle = (value / 100) * 180
  return (
    <div className="relative w-64 h-32">
      <div className="absolute inset-0 rounded-t-full border-8 border-primary"></div>
      <div className="absolute left-1/2 bottom-0 w-0 h-0 border-l-4 border-r-4 border-t-64px border-t-secondary translate-x-[-50%]" style={{ transform: `translateX(-50%) rotate(${angle - 90}deg)` }}></div>
      <div className="absolute left-1/2 top-10 -translate-x-1/2 text-3xl font-semibold">{value}</div>
    </div>
  )
}

function Resilience() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-xl font-semibold mb-4">Resilience Score</div>
        <div className="flex items-center justify-center">
          <Gauge value={82} />
        </div>
        <div className="mt-4 px-3 py-2 rounded bg-primary text-white w-fit">High Resilience Farm</div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="font-medium">Breakdown</div>
        <div className="space-y-3">
          <div className="w-full h-3 rounded bg-neutral/20"><div className="h-3 rounded bg-primary" style={{ width: '78%' }} /></div>
          <div className="w-full h-3 rounded bg-neutral/20"><div className="h-3 rounded bg-primary" style={{ width: '84%' }} /></div>
          <div className="w-full h-3 rounded bg-neutral/20"><div className="h-3 rounded bg-primary" style={{ width: '73%' }} /></div>
          <div className="w-full h-3 rounded bg-neutral/20"><div className="h-3 rounded bg-primary" style={{ width: '69%' }} /></div>
        </div>
      </div>
    </div>
  )
}

export default Resilience
