import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

// For development, we'll use a local Convex instance
// In production, replace with your Convex deployment URL
const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://mock.convex.cloud'

const convex = new ConvexReactClient(convexUrl)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

export { convex }
