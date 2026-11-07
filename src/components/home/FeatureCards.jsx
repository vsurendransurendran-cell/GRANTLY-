import { motion } from 'framer-motion'
import { ArrowUpRight, Landmark, ShieldCheck, ChartNoAxesCombined, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'

const cards = [
  {
    id: 'discover',
    title: 'Discover Opportunities',
    copy: 'Find scholarships that fit your goals and profile.',
    action: 'Browse opportunities',
    Icon: Landmark,
    art: 'campus',
    href: '/discover',
  },
  {
    id: 'eligibility',
    title: 'Check Your Eligibility',
    copy: 'See the criteria behind every match score.',
    action: 'Understand your fit',
    Icon: ShieldCheck,
    art: 'criteria',
    href: '/discover?eligible=1',
  },
  {
    id: 'tracker',
    title: 'Track Your Journey',
    copy: 'Keep saved opportunities and next steps together.',
    action: 'View your tracker',
    Icon: ChartNoAxesCombined,
    art: 'path',
    href: '/tracker',
  },
  {
    id: 'calendar',
    title: 'Meet Every Deadline',
    copy: 'Bring upcoming scholarship dates into focus.',
    action: 'See closing dates',
    Icon: CalendarDays,
    art: 'calendar',
    href: '/calendar',
  },
]

export default function FeatureCards() {
  return (
    <section className="feature-section" aria-labelledby="feature-title">
      <div className="section-heading-row">
        <div>
          <span className="section-kicker">A path that moves with you</span>
          <h2 id="feature-title">From possibility to progress</h2>
        </div>
        <p>One calm place to discover, prepare, and follow through.</p>
      </div>
      <div className="feature-grid">
        {cards.map(({ id, title, copy, action, Icon, art, href }, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.42, delay: index * 0.07 }}
          >
            <Link className="feature-card glass" to={href}>
            <div className={`feature-visual feature-art feature-art-${art}`} aria-hidden="true">
              <span className="feature-art-orbit" /><span className="feature-art-shape" />
              <span className="feature-icon"><Icon size={19} aria-hidden="true" /></span>
            </div>
            <div className="feature-copy">
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="feature-action">{action} <ArrowUpRight size={15} aria-hidden="true" /></span>
            </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
