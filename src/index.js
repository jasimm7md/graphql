import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router basename="/graphql">
    <App />
  </Router>
);
