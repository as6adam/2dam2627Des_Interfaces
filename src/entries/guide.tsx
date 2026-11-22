import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { PreferencesProvider } from '../preferences/PreferencesProvider';
import { guideRouter } from '../guide/router';
import '../styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Falta #root en index.html');

createRoot(root).render(
  <StrictMode>
    <PreferencesProvider>
      <RouterProvider router={guideRouter} />
    </PreferencesProvider>
  </StrictMode>,
);
