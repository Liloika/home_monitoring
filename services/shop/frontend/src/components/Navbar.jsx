import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <span style={styles.logoIcon}>◈</span>
        <span>TechStore</span>
      </Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Каталог</Link>
        <Link to="/orders" style={styles.link}>Заказы</Link>
      </div>
      <div style={styles.user}>
        <span style={styles.username}>{username}</span>
        <button onClick={logout} style={styles.logout}>Выйти</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '56px',
    background: '#111318',
    borderBottom: '1px solid #222530',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
    letterSpacing: '-0.3px',
  },
  logoIcon: {
    color: '#4f8ef7',
    fontSize: '1.2rem',
  },
  links: {
    display: 'flex',
    gap: '32px',
  },
  link: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.15s',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  username: {
    color: '#6b7280',
    fontSize: '0.85rem',
  },
  logout: {
    background: 'transparent',
    color: '#9ca3af',
    border: '1px solid #2d3748',
    padding: '5px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};
