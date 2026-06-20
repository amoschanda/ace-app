import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_aW5ub2NlbnQtb3dsLTUuY2xlcmsuYWNjb3VudHMuZGV2JA';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#c5a880',
          colorBackground: '#0a0b0e',
          colorInputBackground: '#12141a',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255,255,255,0.7)',
          colorNeutral: '#ffffff',
        },
        elements: {
          card: 'bg-ink-light border border-white/10',
          headerTitle: 'font-serif text-white',
          headerSubtitle: 'text-white/60',
          socialButtonsBlockButton: 'border-white/10 hover:bg-white/5',
          formButtonPrimary: 'bg-gold hover:bg-gold-hover text-black',
          footerActionLink: 'text-gold hover:text-gold-hover',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
