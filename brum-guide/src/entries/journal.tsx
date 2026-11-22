import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PreferencesProvider } from '../preferences/PreferencesProvider';
import { JournalPage } from '../journal/JournalPage';
import '../styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Falta #root en diario.html');

createRoot(root).render(
  <StrictMode>
    <PreferencesProvider>
      <JournalPage />
    </PreferencesProvider>
  </StrictMode>,
);
