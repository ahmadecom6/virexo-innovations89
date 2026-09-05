import { Link, useSearchParams } from 'react-router-dom'
import { FiArrowUpRight, FiCheck } from 'react-icons/fi'
import { services } from '../data'
import CtaSection from '../components/CtaSection'

export default function Services() {
  const [params, setParams] = useSearchParams()
  const activeId = services.some((service) => service.id === params.get('service')) ? params.get('service') : services[0].id
  const active = services.find((service) => service.id === activeId)
  const select = (id) => setParams({ service: id })
  return <><section className="page-hero"><span className="eyebrow">Capabilities / 01</span><h1>Services for the <em>next version</em> of your business.</h1><p>We stay deliberately focused: fewer services, deeper thinking, and a stronger line from the customer problem to the business result.</p></section><section className="services-workspace page-section"><div className="service-filter" role="tablist" aria-label="Service detail tabs">{services.map((service) => <button type="button" role="tab" aria-selected={activeId === service.id} className={activeId === service.id ? 'is-active' : ''} key={service.id} onClick={() => select(service.id)}><span>{service.id.replace('-', ' / ')}</span>{service.title}</button>)}</div><article className="service-workspace-panel" role="tabpanel"><div className="workspace-top"><span className="eyebrow">{active.id.replace('-', ' / ')}</span><span>{active.technologies.join(' · ')}</span></div><h2>{active.title}</h2><p className="service-lead">{active.short}</p><div className="service-breakdown"><div><span>Customer problem</span><p>{active.problem}</p></div><div><span>Virexo solution</span><p>{active.solution}</p></div><div><span>Business benefit</span><p>{active.benefit}</p></div></div><div className="workspace-columns"><div><span className="eyebrow">Technologies</span><ul className="pill-list">{active.technologies.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span className="eyebrow">Expected deliverables</span><ul className="check-list">{active.deliverables.map((item) => <li key={item}><FiCheck />{item}</li>)}</ul></div></div><Link className="button-primary" to={`/contact?service=${active.id}`}>Request this service <FiArrowUpRight /></Link></article></section><CtaSection title="Not sure which capability fits? Start with the problem." /></>
}
