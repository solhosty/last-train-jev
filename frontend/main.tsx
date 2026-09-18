import React from 'react';
import { createRoot } from 'react-dom/client';
import TrainApp from './TrainApp';
import './base.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TrainApp />
  </React.StrictMode>,
);
