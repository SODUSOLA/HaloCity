import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-[#0F172A] p-12 lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-white">HaloCity</span>
          </div>
          <p className="mt-16 max-w-xs text-2xl italic leading-relaxed text-slate-300">
            &ldquo;Giving residents, mayors, and city leadership
            a shared operational picture — at all times.&rdquo;
          </p>
          <div className="mt-8 flex gap-4 text-xs text-slate-500">
            <span>55 Users</span>
            <span>·</span>
            <span>10 Zones</span>
            <span>·</span>
            <span>49 Incidents Tracked</span>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to home
        </Link>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
