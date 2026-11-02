import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ToastProvider } from './components/Toast';
import { migrateLegacyStorage } from './lib/migrate';
import { registerServiceWorker } from './lib/systemNotify';
import './styles.css';

migrateLegacyStorage();
if (import.meta.env.PROD) registerServiceWorker();

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
