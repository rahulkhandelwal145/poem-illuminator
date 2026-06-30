import { useState, createContext, useContext } from 'react'
import InputScreen from './components/InputScreen'
import StanzaScreen from './components/StanzaScreen'
import FinalScreen from './components/FinalScreen'
import { parsePoem } from './utils/parsePoem'
import { DEFAULT_THEME } from './utils/themes'
import './styles/globals.css'
import './styles/deco.css'

export const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppContext.Provider')
  return ctx
}

const initial = {
  book: [],
  poem: { title: '', author: '', raw: '' },
  theme: DEFAULT_THEME,
  stanzas: [],
  results: [],
  currentIndex: 0,
  screen: 'input',
}

export default function App() {
  const [state, setState] = useState(initial)

  const updateResult = (index, updates) => {
    setState((prev) => {
      const results = [...prev.results]
      results[index] = { ...results[index], ...updates }
      return { ...prev, results }
    })
  }

  const beginIllumination = (poem, theme) => {
    const stanzas = parsePoem(poem.raw)
    if (stanzas.length === 0) return
    setState((prev) => ({
      ...prev,
      poem,
      theme,
      stanzas,
      results: stanzas.map((stanza) => ({
        stanza,
        visualPrompt: null,
        llmSource: null,
        images: [],
        selectedImage: null,
      })),
      currentIndex: 0,
      screen: 'stanza',
    }))
  }

  const nextStanza = () => {
    setState((prev) => {
      if (prev.currentIndex >= prev.stanzas.length - 1) {
        return { ...prev, screen: 'final' }
      }
      return { ...prev, currentIndex: prev.currentIndex + 1 }
    })
  }

  const goToStanza = (index) => {
    setState((prev) => ({ ...prev, currentIndex: index, screen: 'stanza' }))
  }

  const goHome = () => {
    setState((prev) => ({ ...initial, book: prev.book }))
  }

  const backToInput = () => {
    setState((prev) => ({ ...prev, screen: 'input' }))
  }

  const addToBook = () => {
    setState((prev) => ({
      ...initial,
      book: [...prev.book, { poem: prev.poem, results: prev.results }],
    }))
  }

  const removeFromBook = (index) => {
    setState((prev) => ({
      ...prev,
      book: prev.book.filter((_, i) => i !== index),
    }))
  }

  const ctx = { state, setState, updateResult, beginIllumination, nextStanza, goToStanza, goHome, backToInput, addToBook, removeFromBook }

  return (
    <AppContext.Provider value={ctx}>
      {state.screen === 'input' && <InputScreen />}
      {state.screen === 'stanza' && <StanzaScreen />}
      {state.screen === 'final' && <FinalScreen />}
    </AppContext.Provider>
  )
}
