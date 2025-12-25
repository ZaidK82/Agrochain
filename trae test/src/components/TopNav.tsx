import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWallet } from '../wallet/useWallet'

function TopNav() {
  const { t, i18n } = useTranslation('common')
  const { address, connect, disconnect } = useWallet()

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-[Poppins] font-semibold text-primary">AgroChain</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <NavLink to="/" className="px-3 py-2 rounded hover:bg-accent/10"> {t('nav.dashboard')} </NavLink>
          <NavLink to="/yield" className="px-3 py-2 rounded hover:bg-accent/10"> {t('nav.yield')} </NavLink>
          <NavLink to="/price" className="px-3 py-2 rounded hover:bg-accent/10"> {t('nav.price')} </NavLink>
          <NavLink to="/resilience" className="px-3 py-2 rounded hover:bg-accent/10"> {t('nav.resilience')} </NavLink>
          <NavLink to="/marketplace" className="px-3 py-2 rounded hover:bg-accent/10"> {t('nav.marketplace')} </NavLink>
          <NavLink to="/traceability" className="px-3 py-2 rounded hover:bg-accent/10"> {t('nav.traceability')} </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <select
            className="px-2 py-1 rounded border"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
          {address ? (
            <button onClick={disconnect} className="px-3 py-2 rounded bg-primary text-white">
              {address.slice(0, 6)}...{address.slice(-4)}
            </button>
          ) : (
            <button onClick={connect} className="px-3 py-2 rounded bg-primary text-white">
              {t('wallet.connect')}
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-neutral/30" />
        </div>
      </div>
      <div className="md:hidden border-t">
        <nav className="flex overflow-x-auto gap-2 px-4 py-2 bg-white">
          <NavLink to="/" className="px-3 py-2 rounded bg-neutral/10"> {t('nav.dashboard')} </NavLink>
          <NavLink to="/yield" className="px-3 py-2 rounded bg-neutral/10"> {t('nav.yield')} </NavLink>
          <NavLink to="/price" className="px-3 py-2 rounded bg-neutral/10"> {t('nav.price')} </NavLink>
          <NavLink to="/resilience" className="px-3 py-2 rounded bg-neutral/10"> {t('nav.resilience')} </NavLink>
          <NavLink to="/marketplace" className="px-3 py-2 rounded bg-neutral/10"> {t('nav.marketplace')} </NavLink>
          <NavLink to="/traceability" className="px-3 py-2 rounded bg-neutral/10"> {t('nav.traceability')} </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default TopNav
