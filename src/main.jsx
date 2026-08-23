import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/app.css';
import './App.css';

function Root() {
  return (
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);