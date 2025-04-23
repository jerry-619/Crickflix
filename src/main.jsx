import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TagManager from 'react-gtm-module'
import App from './App.jsx'
const TagMangerArgs = {
  gtmId: 'GTM-NN5JJ4L7',
  };

TagManager.initialize(TagMangerArgs);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
