import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CursorLight from './components/CursorLight'
import Intro from './components/Intro'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'
import ScrollToTop from './lib/ScrollToTop'
import { useSmoothScroll } from './lib/smoothScroll'

export default function App() {
  useSmoothScroll()

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Intro />
      <CursorLight />
      <div className="grain" aria-hidden="true" />
      <Header />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="*" element={<CaseStudy />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
