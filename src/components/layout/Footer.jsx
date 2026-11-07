import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <Link className="footer-brand" to="/" aria-label="Grantly home">
        <span className="brand-star" aria-hidden="true">✦</span>
        <span>GRANTLY</span>
      </Link>
      <p>Empowering Every Student’s Ambition</p>
      <Link className="footer-top" to="/#home" aria-label="Back to home">Back to the stars <ArrowRight size={14} aria-hidden="true" /></Link>
      <small>Sample data for demonstration</small>
    </footer>
  )
}
