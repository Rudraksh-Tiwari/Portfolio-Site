export interface SkillGroup {
  label: string
  items: string[]
}

/** Kept in step with the résumé's Technical Skills section. */
export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    label: 'Backend',
    items: [
      'REST API design',
      'FastAPI',
      'Spring Boot',
      'JWT auth',
      'Background jobs',
      'Concurrency',
      'Distributed systems',
    ],
  },
  {
    label: 'Databases',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'ChromaDB'],
  },
  {
    label: 'Infrastructure and tools',
    items: ['Linux', 'Docker', 'AWS EC2', 'nginx', 'TLS', 'Git', 'GitHub Actions', 'Prometheus', 'React'],
  },
]
