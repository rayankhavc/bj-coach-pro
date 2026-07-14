import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import Play from './pages/Play'
import DrillPage from './pages/DrillPage'
import StrategyPage from './pages/StrategyPage'
import Learn from './pages/Learn'
import About from './pages/About'
import { useGame } from './store/useGame'

function AnimatedRoutes() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/drill" element={<DrillPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const boot = useGame((s) => s.boot)
  useEffect(() => {
    boot()
  }, [boot])

  return (
    <MotionConfig reducedMotion="user">
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </MotionConfig>
  )
}
