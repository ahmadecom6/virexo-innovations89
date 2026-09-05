import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

export default function ServiceCard({ service, compact = false }) {
  return <article className={`service-card ${compact ? 'service-card-compact' : ''}`}><span className="eyebrow-number">{service.id.replace('-', ' / ')}</span><h3>{service.title}</h3><p>{service.short}</p>{!compact && <div className="service-card-meta"><span>{service.technologies.slice(0, 2).join(' / ')}</span><Link to={`/services?service=${service.id}`} aria-label={`Explore ${service.title}`}>Explore <FiArrowUpRight /></Link></div>}</article>
}
