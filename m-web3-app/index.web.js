// index.web.js

import { createRoot } from 'react-dom/client';
import { ExpoRoot } from 'expo-router';

console.log('[index.web.js] Custom entry point loaded');

const ctx = require.context('./app'); // Adjust if your app directory is different

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<ExpoRoot context={ctx} />);
