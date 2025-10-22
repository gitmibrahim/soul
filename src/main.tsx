import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || 'https://mock.convex.cloud');

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>
  <BrowserRouter>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </BrowserRouter>
</React.StrictMode>)
