import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Hero({ onWatchDemo }) {
  return (
    <section className="hero-section" id="home" aria-labelledby="hero-title">
      <div className="dream-art-scene" aria-hidden="true"><span className="dream-moon" /><span className="dream-castle"><i /><i /><i /><b /></span><span className="dream-path" /></div>
      <div className="hero-vignette" aria-hidden="true" />
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <span className="eyebrow hero-eyebrow"><Sparkles size={14} aria-hidden="true" /> Your Dream. Our Mission.</span>
        <h1 id="hero-title">Step Into<br />The <em>Dream Path</em></h1>
        <p className="hero-copy">
          Discover scholarships, understand your eligibility, and keep every next step in view.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/discover">
            Explore Scholarships <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <button className="button button-ghost" type="button" onClick={onWatchDemo}>
            <span className="play-mark"><Play size={13} fill="currentColor" aria-hidden="true" /></span>
            Watch Demo
          </button>
        </div>
        <p className="hero-footnote">A clearer path, one opportunity at a time.</p>
      </motion.div>
      <div className="hero-orbit-note" aria-hidden="true">
        <span className="orbit-star">✦</span>
        <span>Find your<br />next horizon</span>
      </div>
    </section>
  )
}
