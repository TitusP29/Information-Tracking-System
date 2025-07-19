import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Comprehensive WebSocket error suppression
const suppressWebSocketErrors = () => {
  // Suppress console.error for WebSocket issues
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('WebSocket connection') || 
         message.includes('WebSocket is closed') ||
         message.includes('realtime/v1/websocket') ||
         message.includes('wss://') ||
         message.includes('WebSocket'))) {
      // Suppress WebSocket connection warnings
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Also suppress console.warn for WebSocket issues
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('WebSocket connection') || 
         message.includes('WebSocket is closed') ||
         message.includes('realtime/v1/websocket') ||
         message.includes('wss://') ||
         message.includes('WebSocket'))) {
      // Suppress WebSocket connection warnings
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  // Suppress browser-level WebSocket errors
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'error') {
      const wrappedListener = (event) => {
        if (event.error && event.error.message && 
            (event.error.message.includes('WebSocket') || 
             event.error.message.includes('wss://'))) {
          return; // Suppress WebSocket errors
        }
        listener(event);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};

// Apply WebSocket error suppression
suppressWebSocketErrors();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
