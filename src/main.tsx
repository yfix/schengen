import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { registerSw } from './registerSw';
import { applyTheme, prefsStore } from './state/prefs';

applyTheme(prefsStore.get().theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerSw();
