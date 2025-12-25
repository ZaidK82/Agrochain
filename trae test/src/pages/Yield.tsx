import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function Yield() {
  const { t } = useTranslation('common')
  const [form, setForm] = useState({ crop: '', season: '', area: '', soil: '', irrigation: '' })

  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm({ ...form, [k]: v })
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <div className="text-lg font-medium">{t('nav.yield')}</div>
        <select className="w-full border rounded p-2" value={form.crop} onChange={(e) => setField('crop', e.target.value)}>
          <option value="">Select Crop</option>
          <option value="wheat">Wheat</option>
          <option value="rice">Rice</option>
          <option value="maize">Maize</option>
        </select>
        <input className="w-full border rounded p-2" placeholder="Season" value={form.season} onChange={(e) => setField('season', e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Area (ha)" value={form.area} onChange={(e) => setField('area', e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Soil Type" value={form.soil} onChange={(e) => setField('soil', e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Irrigation Type" value={form.irrigation} onChange={(e) => setField('irrigation', e.target.value)} />
        <button className="px-4 py-2 rounded bg-primary text-white">Predict</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="text-lg font-medium">Output</div>
        <div className="mt-4 grid gap-3">
          <div className="text-4xl font-semibold">2,450 kg/ha</div>
          <div className="text-neutral">95% CI: 2,300–2,600</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded bg-accent/10">Rainfall impact: +12%</div>
            <div className="p-3 rounded bg-secondary/10">Temperature impact: -5%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Yield
