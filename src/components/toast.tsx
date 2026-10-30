import { XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** A glass pill that springs up from the bottom of the canvas; `message` null hides it. */
export function Toast({
  message,
  tone = 'neutral',
  action,
  onDismiss,
}: {
  message: ReactNode | null
  tone?: 'neutral' | 'danger'
  action?: ReactNode
  onDismiss?: () => void
}) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className={cn(
            'glass-strong absolute bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5',
            tone === 'danger' && 'text-destructive',
          )}
        >
          <span className="text-small">{message}</span>
          {action}
          {onDismiss && (
            <Button variant="ghost" size="icon-xs" className="rounded-full" onClick={onDismiss} aria-label="Dismiss">
              <XIcon />
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
