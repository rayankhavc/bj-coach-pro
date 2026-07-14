import { useEffect } from 'react'
import { useGame } from '@/store/useGame'
import GameTable from '@/components/GameTable'
import Dock from '@/components/Dock'

export default function Play() {
  const s = useGame()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (document.querySelector('.overlay')) return
      const st = useGame.getState()
      if (st.phase === 'play') {
        if (e.key === '1') st.doAction('H')
        else if (e.key === '2') st.doAction('S')
        else if (e.key === '3') st.doAction('D')
        else if (e.key === '4') st.doAction('P')
      } else if (e.key === 'Enter') {
        if (st.phase === 'bet' && st.bet >= 5) st.startRound()
        else if (st.phase === 'over') st.rebet()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // make sure we're in a clean betting state if arriving fresh
  useEffect(() => {
    const st = useGame.getState()
    if (st.phase !== 'play' && st.phase !== 'dealer' && st.hands.length === 0 && st.shoe.length === 0) {
      s.boot()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="table-main">
        <GameTable />
      </div>
      <Dock />
    </>
  )
}
