import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Shop from './pages/Shop';
import TokenInfo from './pages/TokenInfo';
import Orders from './pages/Orders';
import Navbar from './components/Navbar';

const API = process.env.REACT_APP_API_URL || '';

function PrivateRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/auth/token-info`, { withCredentials: true })
      .then(() => setAuth(true))
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) return <div style={{background:'#0d0f14', minHeight:'100vh'}} />;
  return auth ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout><Shop /></Layout></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>} />
        <Route path="/debug/token" element={<PrivateRoute><Layout><TokenInfo /></Layout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
