import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

export default function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <div className="project-visual">{project.image}<span>{project.category}</span></div>
      <div className="project-card-body">
        <span className="eyebrow-number">{project.category}</span>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <div className="project-tags">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        <Link className="inline-link" to={`/projects/${project.id}`}>
          View case study <FiArrowUpRight />
        </Link>
      </div>
    </article>
  )
}
