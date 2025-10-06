import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Components
import TestComponent from './components/TestComponent';

function App() {
  return (
    <div className="App">
      <TestComponent />
    </div>
  );
}

export default App;