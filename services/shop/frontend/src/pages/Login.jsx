import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register') {
        await axios.post(`${API}/api/auth/register`, form);
        setMode('login');
        setError('Аккаунт создан — войдите');
        return;
      }
      const res = await axios.post(`${API}/api/auth/login`, {
        username: form.username, password: form.password,
      }, { withCredentials: true });
      localStorage.setItem('username', res.data.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка');
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>◈</span>
          <span style={styles.brandName}>TechStore</span>
        </div>
        <p style={styles.subtitle}>
          {mode === 'login' ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
        </p>
        <div style={styles.tabs}>
          <button onClick={() => setMode('login')}
            style={mode === 'login' ? styles.tabActive : styles.tab}>Войти</button>
          <button onClick={() => setMode('register')}
            style={mode === 'register' ? styles.tabActive : styles.tab}>Регистрация</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Имя пользователя</label>
            <input style={styles.input} placeholder="username"
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} placeholder="you@example.com" type="email"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Пароль</label>
            <input style={styles.input} placeholder="••••••••" type="password"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.btn}>
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0d0f14' },
  card: { background: '#111318', border: '1px solid #1e2130',
    padding: '40px', borderRadius: '12px', width: '380px' },
  brand: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  brandIcon: { color: '#4f8ef7', fontSize: '1.4rem' },
  brandName: { color: '#fff', fontSize: '1.2rem', fontWeight: '700' },
  subtitle: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px',
    background: '#0d0f14', padding: '4px', borderRadius: '8px' },
  tab: { flex: 1, padding: '8px', background: 'transparent', color: '#6b7280',
    border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '0.875rem' },
  tabActive: { flex: 1, padding: '8px', background: '#1e2130', color: '#fff',
    border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '0.875rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#9ca3af', fontSize: '0.8rem' },
  input: { padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #1e2130', background: '#0d0f14',
    color: '#fff', fontSize: '0.9rem', outline: 'none' },
  btn: { padding: '11px', background: '#4f8ef7', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '0.9rem',
    cursor: 'pointer', fontWeight: '500', marginTop: '4px' },
  error: { color: '#f87171', fontSize: '0.82rem', textAlign: 'center' },
};
