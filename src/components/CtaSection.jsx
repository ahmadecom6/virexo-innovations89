import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

export default function CtaSection({ title = 'Ready to make the next move?', text = 'Bring us the ambition, the friction, or the unfinished idea. We will help find the useful next step.' }) {
  return <section className="cta-section"><div><span className="eyebrow">05 / Begin somewhere</span><h2>{title}</h2><p>{text}</p></div><Link className="button-primary" to="/contact">Request a consultation <FiArrowUpRight /></Link></section>
}
