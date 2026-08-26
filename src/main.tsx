import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { InstallPromptRegistrar, ServiceWorkerRegistrar, UpdatePrompt } from '@/components/system/PwaRegistrars'

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <ServiceWorkerRegistrar />
    <InstallPromptRegistrar />
    <UpdatePrompt />
    <App />
  </StrictMode>,
)
