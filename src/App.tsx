import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TicketDetails from './components/TicketDetails';
import ActionHandler from './components/ActionHandler';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/ticket/:ticketNumber" element={<TicketDetails />} />
          <Route path="/action" element={<ActionHandler />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
