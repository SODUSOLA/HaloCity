import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F172A] px-4"
      style={{
        backgroundImage:
          'linear-gradient(rgba(30, 64, 175, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 64, 175, 0.07) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div className={`max-w-4xl text-center transition-all duration-600 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
          <span></span>
          <span>KingdomHack — Redemption City Smart City Challenge · Track 0D</span>
        </div>

        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
          Real-time smart city ops
          <br />
          for <span className="relative">Redemption City.
            <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-primary" />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
           HaloCity unifies incident reporting, emergency escalation, and mayor
           coordination — giving residents, Traffic Mayors, and city leadership a
          shared operational picture during the Holy Ghost Congress and beyond.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/register">
            <Button className="h-auto bg-white px-8 py-4 text-base font-semibold text-slate-900 hover:bg-slate-100">
              Get Started Free →
            </Button>
          </Link>
          <Link to="/login">
            <Button
              variant="outline"
              className="h-auto border-white bg-transparent px-8 py-4 text-base font-semibold text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-4">
          <Link to="/report" className="text-sm text-blue-400 underline underline-offset-4 hover:text-blue-300">
            Report an incident (no account needed)
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Already deployed · 55 users · 10 city zones · Live on Render + Vercel
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-slate-500" />
      </div>
    </section>
  )
}
