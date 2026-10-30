import { ExternalLinkIcon, EyeIcon, EyeOffIcon, TrashIcon, XIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { decryptSecret, encryptSecret } from '../crypto'
import { useStack } from '../store'
import type { Problem, Tech } from '../types'
import { TechIcon } from './nodes'

const NOTE_TONE: Record<Problem['severity'], string> = {
  error: 'bg-destructive/10 text-destructive',
  warn: 'bg-warning/10 text-warning',
}

/** a titled row of capability chips; renders nothing when there are none */
function ChipList({ title, items, tone }: { title: string; items?: string[]; tone: string }) {
  if (!items?.length) return null
  return (
    <div className="mt-4">
      <div className="text-caption uppercase text-muted-foreground">{title}</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {items.map((c) => (
          <span key={c} className={cn('rounded-full px-2 py-0.5 font-mono text-micro', tone)}>
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: (id: string) => React.ReactNode; hint?: string }) {
  const id = useId()
  return (
    <div className="mt-3 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {hint && <p className="text-small text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** sets the session passphrase; an empty field clears it */
function PassphraseField({ onStatus }: { onStatus: (s: string) => void }) {
  const { passphrase, setPassphrase } = useStack()
  const [pass, setPass] = useState('')
  const apply = () => {
    setPassphrase(pass || null)
    setPass('')
    onStatus(pass ? 'Passphrase set.' : 'Passphrase cleared.')
  }
  return (
    <Field
      label="Passphrase (this session only)"
      hint="AES-GCM in your browser. The passphrase is never stored — clear it and the saved password is unreadable."
    >
      {(id) => (
        <div className="flex gap-2">
          <Input
            id={id}
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder={passphrase ? 'set' : 'not set'}
          />
          <Button variant="secondary" onClick={apply}>
            Set
          </Button>
        </div>
      )}
    </Field>
  )
}

/** Right floating drawer for the selected block: details, problems and its encrypted account fields. */
export function Drawer({ tech, problems }: { tech: Tech; problems: Problem[] }) {
  const { creds, setCreds, select, requestRemove, passphrase } = useStack()
  const saved = creds[tech.id] ?? {}

  const [url, setUrl] = useState(saved.url ?? '')
  const [username, setUsername] = useState(saved.username ?? '')
  const [notes, setNotes] = useState(saved.notes ?? '')
  const [secret, setSecret] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const c = creds[tech.id] ?? {}
    setUrl(c.url ?? '')
    setUsername(c.username ?? '')
    setNotes(c.notes ?? '')
    setSecret('')
    setRevealed(false)
    setStatus(null)
  }, [tech.id, creds])

  const save = async () => {
    const next = { ...saved, url, username, notes }
    if (secret) {
      if (!passphrase) return setStatus('Set a passphrase first to encrypt the password.')
      next.secret = await encryptSecret(secret, passphrase)
    }
    setCreds(tech.id, next)
    setStatus('Saved.')
  }

  const reveal = async () => {
    if (!saved.secret) return
    if (!passphrase) return setStatus('Enter your passphrase to decrypt.')
    const plain = await decryptSecret(saved.secret, passphrase)
    if (plain === null) return setStatus('Wrong passphrase.')
    setSecret(plain)
    setRevealed(true)
    setStatus(null)
  }

  const toggleReveal = () => {
    if (!revealed) return reveal()
    setRevealed(false)
    setSecret('')
  }

  return (
    <motion.aside
      aria-label={`${tech.name} details`}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
      className="glass absolute bottom-[4.5rem] right-3 top-[4.75rem] z-10 flex w-[22rem] flex-col overflow-y-auto rounded-3xl p-5"
    >
      <div className="flex items-start gap-3">
        <TechIcon tech={tech} className="mt-1 size-7" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-h2 text-foreground">{tech.name}</h2>
          <p className="text-caption uppercase text-muted-foreground">{tech.section}</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={() => select(null)}>
          <XIcon />
        </Button>
      </div>

      <p className="mt-3 text-body text-muted-foreground">{tech.desc}</p>

      {problems.map((p) => (
        <p key={p.message} className={cn('mt-2 rounded-xl px-3 py-2 text-small', NOTE_TONE[p.severity])}>
          {p.message}
        </p>
      ))}

      <ChipList title="Provides" items={tech.provides} tone="bg-success/12 text-success" />
      <ChipList title="Requires" items={tech.needs} tone="bg-accent text-foreground" />

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="text-caption uppercase text-muted-foreground">Account</h3>

        <Field label="Console URL">
          {(id) => (
            <Input id={id} value={url} onChange={(e) => setUrl(e.target.value)} placeholder={tech.url ?? 'https://…'} />
          )}
        </Field>

        <Field label="Username">
          {(id) => <Input id={id} value={username} onChange={(e) => setUsername(e.target.value)} />}
        </Field>

        <Field label="Password">
          {(id) => (
            <div className="relative">
              <Input
                id={id}
                type={revealed ? 'text' : 'password'}
                value={!revealed && saved.secret ? '••••••••••' : secret}
                onChange={(e) => {
                  setSecret(e.target.value)
                  setRevealed(true)
                }}
                className="pr-10 font-mono"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
                aria-label={revealed ? 'Hide password' : 'Decrypt and show password'}
                onClick={toggleReveal}
              >
                {revealed ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>
          )}
        </Field>

        <PassphraseField onStatus={setStatus} />

        <Field label="Notes">
          {(id) => (
            <Textarea
              id={id}
              rows={2}
              className="resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          )}
        </Field>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save}>Save</Button>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-small font-medium text-link hover:underline"
            >
              Open <ExternalLinkIcon className="size-3.5" />
            </a>
          )}
          {status && (
            <span role="status" className="text-small text-muted-foreground">
              {status}
            </span>
          )}
        </div>
      </div>

      <Button variant="destructive" className="mt-6 self-start" onClick={() => requestRemove(tech.id)}>
        <TrashIcon />
        Remove from stack
      </Button>
    </motion.aside>
  )
}
