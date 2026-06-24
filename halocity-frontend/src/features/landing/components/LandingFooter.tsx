import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const navLinks = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Roles', href: '#roles' },
]

export default function LandingFooter() {
  return (
    <footer className="bg-[#0F172A] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-white">HaloCity</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Smart City Incident Management for Redemption City
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              KingdomHack 2026 · Track 0D · Incident Management
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Platform</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Access</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-xs text-slate-400 transition-colors hover:text-white">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="text-xs text-slate-400 transition-colors hover:text-white">Register as Citizen</Link>
              </li>
              <li>
                <Link to="/register" className="text-xs text-slate-400 transition-colors hover:text-white">Register as Marshal</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-8 text-[11px] text-slate-600 sm:flex-row">
          <p>© 2026 HaloCity. Built by Oluwasemilore Odusola for KingdomHack.</p>
          <p>Deployed on Render · Vercel · Neon · Railway</p>
        </div>
      </div>
    </footer>
  )
}
