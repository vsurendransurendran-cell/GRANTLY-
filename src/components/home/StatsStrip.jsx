import { CircleDollarSign, GraduationCap, ListChecks, Target } from 'lucide-react'

const ICONS = {
  funding: GraduationCap,
  secured: CircleDollarSign,
  active: ListChecks,
  match: Target,
}

export default function StatsStrip({ stats }) {
  return (
    <section className="stats-strip glass" aria-label="Your live scholarship overview">
      {stats.map((stat) => {
        const Icon = ICONS[stat.key]
        return (
          <div className="stat-item" key={stat.key}>
            <span className="stat-icon"><Icon size={25} strokeWidth={1.8} aria-hidden="true" /></span>
            <div className="stat-copy">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        )
      })}
    </section>
  )
}
