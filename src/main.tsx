import { StrictMode } from 'react';
// lets you find common bugs in your components early during development.
import { createRoot } from 'react-dom/client';
// lets you create a root to display React components inside a browser DOM node.
import App from './App.tsx';
import './theme/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
