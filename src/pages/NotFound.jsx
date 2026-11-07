import { Link } from 'react-router-dom'
import WorkspaceLayout from '../components/layout/WorkspaceLayout.jsx'
export default function NotFound() {
  return <WorkspaceLayout title="That path isn’t here" eyebrow="404 · Page not found" description="The address may be outdated or mistyped."><div className="empty-state glass"><h2>Let’s get you back on track.</h2><p>Return to the home page or explore the scholarship catalog.</p><div className="not-found-actions"><Link className="button button-primary" to="/">Go home</Link><Link className="button button-secondary" to="/discover">Discover scholarships</Link></div></div></WorkspaceLayout>
}
