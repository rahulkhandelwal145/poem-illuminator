import { useApp } from '../App'

export default function HomeButton() {
  const { goHome } = useApp()

  const handleClick = () => {
    if (window.confirm('Leave this poem? Any unsaved progress will be lost.')) {
      goHome()
    }
  }

  return (
    <button className="home-btn" onClick={handleClick} aria-label="Back to home" title="Back to home">
      ⌂ Home
    </button>
  )
}
