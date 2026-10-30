import { DownloadIcon, LayoutGridIcon, UploadIcon } from 'lucide-react'
import { useState } from 'react'
import { BadgeMorph, type BadgeStatus } from '@/components/ruixen/badge-morph'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Mark, Wordmark } from '@/components/wordmark'
import { useStack } from '../store'
import type { Problem } from '../types'
import { ClearDialog } from './dialogs'
import { Filters } from './filters'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** What the status pill says about the stack as a whole. */
function stackStatus(problems: Problem[], blocks: number): { status: BadgeStatus; label: string } {
  const errors = problems.filter((p) => p.severity === 'error').length
  const warns = problems.length - errors
  if (!blocks) return { status: 'idle', label: 'Empty stack' }
  if (errors) return { status: 'error', label: `${errors} blocking` }
  if (warns) return { status: 'warning', label: plural(warns, 'warning') }
  return { status: 'success', label: 'Stack is coherent' }
}

/** Floating glass header: the name, the highlight filters, stack status, import/export and theme. */
export function TopBar({ problems }: { problems: Problem[] }) {
  const { highlight, setHighlight, added, nodePos, groupPos, creds, load, resetPositions } = useStack()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const { status, label } = stackStatus(problems, added.length)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ added, nodePos, groupPos, creds }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'stack.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <header className="glass-strong absolute inset-x-3 top-3 z-20 flex h-14 items-center gap-3 rounded-3xl pl-3 pr-2">
      <h1 className="flex shrink-0 items-center gap-2">
        <Mark />
        <Wordmark />
      </h1>
      <span className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
      <Filters highlight={highlight} setHighlight={setHighlight} />

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <BadgeMorph status={status} label={label} className="mr-1" />
        <Button variant="ghost" onClick={resetPositions}>
          <LayoutGridIcon />
          Re-arrange
        </Button>
        {/* a file input needs a real label around it; the Button only lends its styling */}
        <Button variant="ghost" asChild>
          <label className="cursor-pointer">
            <DownloadIcon />
            Import
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(e) => e.target.files?.[0]?.text().then((t) => load(JSON.parse(t)))}
            />
          </label>
        </Button>
        <Button onClick={exportJson}>
          <UploadIcon />
          Export
        </Button>
        <Button
          variant="ghost"
          className="text-destructive"
          disabled={!added.length}
          onClick={() => setConfirmingClear(true)}
        >
          Clear
        </Button>
        <ThemeToggle />
      </div>

      <ClearDialog open={confirmingClear} onOpenChange={setConfirmingClear} />
    </header>
  )
}
