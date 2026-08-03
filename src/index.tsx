import { createRoot } from 'react-dom/client';

import App from './App';
import { initTheme } from './lib/theme';
import './styles/index.css';

// Keep asset-epoch define in the entry graph so redeploys change hashed URLs.
void process.env.ALEPHYEAH_ASSET_EPOCH;

initTheme();

createRoot(document.getElementById('root')!).render(<App />);
