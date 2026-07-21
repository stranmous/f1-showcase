import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'
import '@fontsource/barlow-condensed/latin-700-italic.css'
import '@fontsource-variable/manrope/wght.css'
import App from './App'
import './styles/global.css'

/*
      =========================================================
      F1 Cars Showcase
      Designed and developed by Waqas Zafar
      GitHub: https://github.com/stranmous
      LinkedIn: https://linkedin.com/in/waqas75
      =========================================================
    */

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Application root was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
