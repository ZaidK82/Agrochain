import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { m: 'Jan', low: 1700, mid: 1850, high: 2000 },
  { m: 'Feb', low: 1800, mid: 1950, high: 2100 },
  { m: 'Mar', low: 1900, mid: 2100, high: 2300 },
  { m: 'Apr', low: 1850, mid: 2050, high: 2250 },
]

function Price() {
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-4">
      <div className="text-lg font-medium mb-2">Price Forecast</div>
      <div className="h-80">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <XAxis dataKey="m" />
            <YAxis />
            <Tooltip />
            <Area dataKey="high" stroke="#0288D1" fill="#0288D1" fillOpacity={0.15} />
            <Area dataKey="mid" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.15} />
            <Area dataKey="low" stroke="#6D4C41" fill="#6D4C41" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="px-3 py-2 rounded bg-accent text-white">Best Time to Sell: Mar</div>
        <button className="px-3 py-2 rounded border">Download forecast report</button>
      </div>
    </div>
  )
}

export default Price
