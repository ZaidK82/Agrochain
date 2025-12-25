import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'

const yieldData = [
  { month: 'Jan', hist: 18, pred: 20 },
  { month: 'Feb', hist: 22, pred: 23 },
  { month: 'Mar', hist: 24, pred: 26 },
  { month: 'Apr', hist: 21, pred: 25 },
]

const priceData = [
  { month: 'Jan', price: 1800 },
  { month: 'Feb', price: 1950 },
  { month: 'Mar', price: 2100 },
  { month: 'Apr', price: 2050 },
]

const heatmapGrid = Array.from({ length: 28 }).map((_, i) => ({ idx: i, val: Math.random() }))

function StatCard({ title, value, accent }: { title: string; value: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-neutral">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
      <div className={`w-10 h-10 rounded-full ${accent || 'bg-accent/20'}`} />
    </div>
  )
}

function Dashboard() {
  const { t } = useTranslation('common')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title={t('dashboard.predictedYield')} value="2,450 kg/ha" />
        <StatCard title={t('dashboard.expectedPrice')} value="₹2,150/quintal" />
        <StatCard title={t('dashboard.resilienceScore')} value="82" accent="bg-primary/20" />
        <StatCard title={t('dashboard.nftStatus')} value="Minted" accent="bg-secondary/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:col-span-2">
          <div className="mb-2 font-medium">Historical vs Predicted Yield</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hist" stroke="#6D4C41" />
                <Line type="monotone" dataKey="pred" stroke="#0288D1" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="mb-2 font-medium">Monthly Price Forecast</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="price" fill="#2E7D32" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:col-span-3">
          <div className="mb-2 font-medium">Climate Stress Indicators</div>
          <div className="grid grid-cols-7 gap-2">
            {heatmapGrid.map((c) => (
              <div
                key={c.idx}
                className="w-full h-8 rounded"
                style={{ backgroundColor: `rgba(211,47,47,${c.val})` }}
              />
            ))}
          </div>
        </div>
        <aside className="bg-white rounded-xl shadow-sm p-4">
          <div className="mb-2 font-medium">{t('dashboard.advisory')}</div>
          <ul className="space-y-2">
            <li className="p-3 rounded bg-warning/20">High rainfall risk next month</li>
            <li className="p-3 rounded bg-accent/20">Delay selling by 2 weeks for better price</li>
            <li className="p-3 rounded bg-primary/20">Irrigation efficiency improving</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard
