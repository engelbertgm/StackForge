/**
 * Ruixen UI "Badge Morph", adapted to StackForge: colours come from the design tokens instead
 * of fixed rgba, and a `warning` state was added for a stack that works but has loose ends.
 * Source: https://ruixen.com/r/badge-morph.json
 */
import { AnimatePresence, motion } from 'motion/react'
import type { JSX } from 'react'
import { cn } from '@/lib/utils'

/** The five states the status pill can morph between. */
export type BadgeStatus = 'idle' | 'loading' | 'success' | 'warning' | 'error'

/** Props for BadgeMorph: which state it shows and the words beside the icon. */
export interface BadgeMorphProps {
  status: BadgeStatus
  label: string
  className?: string
}

// Dynamic Island springs
const SPRING_PILL = { type: 'spring' as const, stiffness: 400, damping: 30 }
const SPRING_CONTENT = { type: 'spring' as const, stiffness: 420, damping: 25 }
const SPRING_DRAW = { type: 'spring' as const, stiffness: 300, damping: 15 }

const ACCENT: Record<BadgeStatus, string> = {
  idle: 'text-muted-foreground',
  loading: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
}

// the backlight each state radiates, from the same tokens as the text
const GLOW: Record<BadgeStatus, string> = {
  idle: 'var(--shadow-xs)',
  loading: 'var(--shadow-xs)',
  success: 'var(--shadow-xs), 0 0 24px -8px var(--success)',
  warning: 'var(--shadow-xs), 0 0 24px -8px var(--warning)',
  error: 'var(--shadow-xs), 0 0 24px -6px var(--destructive)',
}

function IdleDot() {
  return (
    <span className="relative flex size-4 items-center justify-center">
      <motion.span
        className="absolute size-1.5 rounded-full bg-current opacity-30"
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <span className="relative size-1.5 rounded-full bg-current opacity-60" />
    </span>
  )
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="animate-[badge-morph-spin_0.8s_linear_infinite]"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.12" />
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="26 37.7"
      />
    </svg>
  )
}

function Drawn({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ ...SPRING_DRAW, delay }}
      />
    </svg>
  )
}

const ICONS: Record<BadgeStatus, () => JSX.Element> = {
  idle: IdleDot,
  loading: Spinner,
  success: () => <Drawn d="M5 8.5L7 10.5L11 5.5" />,
  warning: () => <Drawn d="M8 4.5V9M8 11.5V11.6" />,
  error: () => <Drawn d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" delay={0.04} />,
}

/** A status pill that morphs its width, icon and label between states with springs. */
export function BadgeMorph({ status, label, className }: BadgeMorphProps) {
  const Icon = ICONS[status]
  return (
    <motion.div
      layout
      role="status"
      transition={{ layout: SPRING_PILL }}
      animate={status === 'success' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      className={cn(
        'relative inline-flex select-none items-center gap-2 rounded-full px-3 py-1.5',
        'glass-strong text-small font-medium text-foreground transition-[box-shadow] duration-500 ease-out',
        className,
      )}
      style={{ boxShadow: GLOW[status] }}
    >
      <div className="relative flex size-4 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            className={cn('flex items-center justify-center', ACCENT[status])}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.08 } }}
            transition={SPRING_CONTENT}
          >
            <Icon />
          </motion.span>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${status}-${label}`}
          className="whitespace-nowrap leading-none"
          initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.08 } }}
          transition={{ ...SPRING_CONTENT, delay: 0.025, filter: { duration: 0.3 } }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
