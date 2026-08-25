export interface SkillGroup {
  label: string
  items: string[]
}

/**
 * Drawn from what the projects on this site actually run, and kept in step
 * with the résumé. Nothing is listed that no project here demonstrates — a
 * tools list is a set of claims, and each one should have something behind it.
 */
export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['Java', 'Python', 'TypeScript', 'SQL', 'Lua'],
  },
  {
    label: 'Backend',
    items: ['FastAPI', 'Spring Boot', 'SQLAlchemy', 'Pydantic', 'gunicorn / uvicorn', 'JWT'],
  },
  {
    label: 'Data',
    items: ['PostgreSQL', 'Redis', 'ChromaDB'],
  },
  {
    label: 'ML & retrieval',
    items: ['scikit-learn', 'XGBoost', 'SHAP', 'pandas', 'NumPy', 'sentence-transformers', 'Groq'],
  },
  {
    label: 'Frontend',
    items: ['React 19', 'Vite', 'Zustand', 'Recharts', 'Tailwind CSS', 'Streamlit'],
  },
  {
    label: 'Infrastructure',
    items: ['Docker', 'AWS EC2', 'nginx', 'systemd', 'certbot / TLS', 'Git'],
  },
]
