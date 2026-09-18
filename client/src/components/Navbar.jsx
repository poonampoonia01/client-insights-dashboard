import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { advisor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="app-wordmark">Ledger</div>
      <div className="app-header-right">
        <span className="advisor-name">{advisor?.name}</span>
        <button className="btn btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
