import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import kaplay from 'kaplay'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
)

// Initialize the game
kaplay({
  width: 720,
  height: 1280,
  letterbox: true,
  root: document.getElementById('game'),
})

