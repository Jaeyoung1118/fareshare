import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// React 18 이상에서는 ReactDOM.createRoot를 사용합니다.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// reportWebVitals는 선택 사항입니다. 성능 측정을 위해 사용하는 부분입니다.
reportWebVitals();
