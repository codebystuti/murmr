import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import App from './App';
import { queryClient } from './lib/queryClient';
import { initSeed } from './lib/seed';
import './styles/globals.css';
import './styles/gradients.css';

initSeed();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-dark)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
