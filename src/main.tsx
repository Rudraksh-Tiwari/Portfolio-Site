import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Arm the scroll reveals. Until this runs, the CSS keeps every .reveal fully
// visible — so a failed bundle degrades to a plain, readable page rather than
// a blank one. Reduced-motion users never get the hidden state at all.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reveals-armed')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
