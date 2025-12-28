import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import Landing from './pages/Landing';
import About from './pages/About'; // Add Import

import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" theme="dark" />
      <AppNavbar />
      <main className="app-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} /> {/* Add Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Voter Routes */}
          <Route element={<ProtectedRoute allowedRoles={['voter', 'admin']} />}>
            <Route path="/dashboard" element={<VoterDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
    </>
  );
};

export default App;
