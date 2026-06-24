import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 500000, suffix: '+', label: 'Annual attendees during peak programs' },
  { value: 2, prefix: '< ', suffix: ' min', label: 'Target: incident to marshal acknowledgement' },
  { value: 10, suffix: '', label: 'City zones digitally mapped and active' },
  { value: 99.9, suffix: '%', label: 'Target command dashboard uptime' },
]

function Counter({ end, prefix, suffix }: { end: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || !entry.isIntersecting || started.current) return
        started.current = true
        const duration = 1500
        const startTime = performance.now()

        const animate = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          setCount(Math.floor(progress * end))
          if (progress < 1) requestAnimationFrame(animate)
        }

        requestAnimationFrame(animate)
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [end])

  const display = end >= 1000 ? count.toLocaleString() : count

  return (
    <span ref={ref} className="text-5xl font-bold text-white md:text-6xl">
      {prefix}{display}{suffix}
    </span>
  )
}

export default function StatsSection() {
  return (
    <section className="bg-[#0F172A] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <Counter end={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} />
              <p className="mt-2 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-base italic text-slate-400">
          Built for the Holy Ghost Congress. Ready for Redemption City at scale.
        </p>
      </div>
    </section>
  )
}
