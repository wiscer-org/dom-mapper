import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => <div>DOMMapper Extension Popup</div>;

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
