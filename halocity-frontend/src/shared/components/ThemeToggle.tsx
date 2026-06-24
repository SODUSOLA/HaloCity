import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/shared/stores/ThemeContext'
import { cn } from '@/shared/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'text-muted-foreground hover:bg-surface-alt hover:text-foreground',
        className,
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {theme === 'light' ? 'Dark mode' : 'Light mode'}
    </button>
  )
}
