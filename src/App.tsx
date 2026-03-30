import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SnakeGamePage from '@/pages/SnakeGame'
import LinkMatchGamePage from '@/pages/LinkMatchGame'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/snake" replace />} />
        <Route path="/snake" element={<SnakeGamePage />} />
        <Route path="/link-match" element={<LinkMatchGamePage />} />
      </Routes>
    </BrowserRouter>
  )
}
