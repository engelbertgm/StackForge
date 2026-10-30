import { MotionConfig } from 'motion/react'
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App.tsx'
import './index.css'

// ponytail: a two-entry route table, not a router; reach for one when there is a third page
const ROUTES = [{ path: '/design-system', page: lazy(() => import('./design-system')) }]
const Page = ROUTES.find((r) => r.path === window.location.pathname)?.page ?? App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* every Motion animation follows the OS "reduce motion" setting */}
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <Suspense>
          <Page />
        </Suspense>
      </TooltipProvider>
    </MotionConfig>
  </StrictMode>,
)
