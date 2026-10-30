import { TrashIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { techById } from '../catalog'
import { useStack } from '../store'

const hasCreds = (c?: { url?: string; username?: string; secret?: string; notes?: string }) =>
  !!(c && (c.url || c.username || c.secret || c.notes))

/**
 * Asks before clearing the canvas. Clear is the one action with no undo behind it — Ctrl+Z
 * only puts back a single removed block — so it names exactly what will be lost.
 */
export function ClearDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { added, creds, clear } = useStack()
  const savedCount = added.filter((id) => hasCreds(creds[id])).length
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-strong">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TrashIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Clear the workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes all {added.length} {added.length === 1 ? 'block' : 'blocks'} and every position you arranged
            {savedCount ? `, along with the account details saved on ${savedCount} of them` : ''}. It cannot be undone.
            Export first if you want to keep this stack.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-transparent">
          <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={clear}>
            Clear everything
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Asks before removing a block that has account details saved on it. */
export function DeleteGuard() {
  const { confirming, confirmRemove, cancelRemove, creds } = useStack()
  const c = confirming ? (creds[confirming] ?? {}) : {}
  const filled = [
    c.url && 'a console URL',
    c.username && 'a username',
    c.secret && 'a saved password',
    c.notes && 'notes',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <AlertDialog open={!!confirming} onOpenChange={(open) => !open && cancelRemove()}>
      <AlertDialogContent className="glass-strong">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TrashIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Remove {confirming ? techById.get(confirming)?.name : ''}?</AlertDialogTitle>
          <AlertDialogDescription>
            This block has {filled} saved on it. Removing it discards that too.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-transparent">
          <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirmRemove}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
