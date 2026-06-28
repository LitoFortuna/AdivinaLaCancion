import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import InstallPWA from './components/InstallPWA'
import AuroraBg from './components/AuroraBg'
import Header from './components/Header'
import Setup from './pages/Setup'
import DailyGame from './pages/DailyGame'
import FreePlay from './pages/FreePlay'

function GameLayout({ children }) {
  return (
    <div className="flex flex-col min-h-[100svh]">
      <Header />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <InstallPWA />
      <AuroraBg />
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/"      element={<GameLayout><DailyGame /></GameLayout>} />
        <Route path="/daily" element={<GameLayout><DailyGame /></GameLayout>} />
        <Route path="/free"  element={<GameLayout><FreePlay  /></GameLayout>} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
