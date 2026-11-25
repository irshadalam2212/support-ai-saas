import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { router } from './routes/router.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './components/auth/AuthProvider'
import { ApiError } from './lib/api'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx response will not change on retry, so show it straight away.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
