export interface Role {
  period: string
  title: string
  org: string
  body: string
}

export interface School {
  period: string
  name: string
  detail: string
  /** Shown large beside the name, e.g. the CGPA. */
  score?: { value: string; label: string }
  body: string
}

export interface Certification {
  issuer: string
  items: string
}

export const work: Role[] = [
  {
    period: 'Oct 2024 - Nov 2024',
    title: 'Web Development Intern',
    org: 'SkillCraft Technology, Bengaluru',
    body: "Built frontend and backend features with HTML, CSS and JavaScript inside a real project structure, using Git and the team's development workflow.",
  },
]

export const education: School[] = [
  {
    period: '2023 - 2027',
    name: 'Nitte Meenakshi Institute of Technology',
    detail: 'B.E. Computer Science and Engineering, Bengaluru',
    score: { value: '8.32', label: 'CGPA' },
    body: 'Coursework in data structures, algorithms, operating systems, database systems, computer networks and object-oriented programming.',
  },
  {
    period: '2021 - 2023',
    name: 'Deva Matha Central School',
    detail: 'Bengaluru',
    body: 'Class 12 (CBSE): 76.6%. Class 10: 81.1%.',
  },
]

export const award = {
  year: '2024',
  title: 'Runner-up, Coding Battles',
  body: 'Inter-college competitive programming contest.',
}

export const certifications: Certification[] = [
  { issuer: 'Apna College, 2025', items: 'Data Structures and Algorithms using Java; Web Development' },
  { issuer: 'MongoDB, 2025', items: 'Python Developer Path; Database Administration Path' },
  { issuer: 'Infosys Springboard', items: 'Java Foundation; Software Engineering Fundamentals; Machine Learning Foundation' },
]
