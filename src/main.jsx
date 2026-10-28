import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/800.css';
import '@fontsource/caveat/600.css';
import '@fontsource/oswald/600.css';
import '@fontsource/yellowtail/400.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/app.css';
import './styles/flow.css';
import './styles/itinerary.css';
import './styles/polish.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
