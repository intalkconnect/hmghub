import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Conecta o socket assim que a aplicação inicia
connectSocket()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
