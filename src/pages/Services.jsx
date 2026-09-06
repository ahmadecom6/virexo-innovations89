import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiArrowUpRight, FiCheck } from 'react-icons/fi'
import { services } from '../data'
import CtaSection from '../components/CtaSection'

const categories = ['All Services', 'Development', 'Design', 'Automation', 'Growth', 'Support']
const categoryFor = (service) => {
  if (service.id.includes('design')) return 'Design'
  if (service.id.includes('automation')) return 'Automation'
  if (service.id.includes('ecommerce')) return 'Growth'
  if (service.id.includes('maintenance')) return 'Support'
  return 'Development'
}

export default function Services() {
  const [params, setParams] = useSearchParams()
  const [category, setCategory] = useState('All Services')
  const filtered = category === 'All Services' ? services : services.filter((service) => categoryFor(service) === category)
  const activeId = filtered.some((service) => service.id === params.get('service')) ? params.get('service') : filtered[0].id
  const active = services.find((service) => service.id === activeId)
  const select = (id) => setParams({ service: id })
  return <><section className="page-hero"><span className="eyebrow">Capabilities / 01</span><h1>Services for the <em>next version</em> of your business.</h1><p>We stay deliberately focused: fewer services, deeper thinking, and a stronger line from the customer problem to the business result.</p></section><section className="page-section services-page"><div className="service-category-filter" role="tablist" aria-label="Service categories">{categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? 'is-active' : ''} onClick={() => { setCategory(item); setParams({ service: (item === 'All Services' ? services : services.filter((service) => categoryFor(service) === item))[0].id }) }}>{item}</button>)}</div><div className="services-workspace"><div className="service-filter" role="tablist" aria-label="Service detail tabs">{filtered.map((service) => <button type="button" role="tab" aria-selected={activeId === service.id} className={activeId === service.id ? 'is-active' : ''} key={service.id} onClick={() => select(service.id)}><span>{categoryFor(service)}</span>{service.title}</button>)}</div><article className="service-workspace-panel" role="tabpanel"><div className="workspace-top"><span className="eyebrow">{active.id.replaceAll('-', ' / ')}</span><span>{active.technologies.join(' · ')}</span></div><h2>{active.title}</h2><p className="service-lead">{active.short}</p><div className="service-breakdown"><div><span>Customer problem</span><p>{active.problem}</p></div><div><span>Virexo solution</span><p>{active.solution}</p></div><div><span>Business benefit</span><p>{active.benefit}</p></div></div><div className="workspace-columns"><div><span className="eyebrow">Technologies</span><ul className="pill-list">{active.technologies.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span className="eyebrow">Expected deliverables</span><ul className="check-list">{active.deliverables.map((item) => <li key={item}><FiCheck />{item}</li>)}</ul></div></div><Link className="button-primary" to={`/contact?service=${active.id}`}>Request this service <FiArrowUpRight /></Link></article></div></section><CtaSection title="Not sure which capability fits? Start with the problem." /></>
}
