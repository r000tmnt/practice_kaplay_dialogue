import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import dialogueStore from './store/dialogue.js'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={dialogueStore}>
      <App />
    </Provider>
  </StrictMode>,
)

