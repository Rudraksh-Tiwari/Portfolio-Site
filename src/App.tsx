import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Intro from './components/Intro'
import Home from './pages/Home'
import Projects from './pages/Projects'
import CaseStudy, { LegacyWorkRedirect } from './pages/CaseStudy'
import Experience from './pages/Experience'
import NotFound from './pages/NotFound'
import ScrollToTop from './lib/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Intro />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[110] focus:rounded-[10px] focus:bg-btn focus:px-4 focus:py-2.5 focus:font-semibold focus:text-btn-fg"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<CaseStudy />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/work/:slug" element={<LegacyWorkRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
