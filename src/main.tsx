import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import './index.css'
import App from './App.tsx'
import { AppDataProvider } from './context/AppDataContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <HeroUIProvider locale="ru-RU">
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </HeroUIProvider>
    </ThemeProvider>
  </StrictMode>,
)
