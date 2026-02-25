import React from 'react'
import ReactDOM from 'react-dom/client'
import { TetrisGame } from './components/TetrisGame'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TetrisGame />
  </React.StrictMode>,
)
