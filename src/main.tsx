import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import TrainApp from './TrainApp';
import './styles.css';
import './single-screen.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{location.pathname === '/hotel' ? <App /> : <TrainApp />}</React.StrictMode>,
);
