import { useState } from 'react';
import { login, signup } from '../services/api';
import '../styles/auth.css';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { userId } = await login(username, password);
        onAuth(userId, false);
      } else {
        const { userId } = await signup(username, password);
        onAuth(userId, true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-seal">⬡</div>
          <div className="auth-brand-name">DecentralID</div>
          <div className="auth-brand-sub">Sovereign Identity Protocol</div>
        </div>
        <div className="auth-hero">
          <h2>Your identity,<br />on the chain.</h2>
          <p>
            A decentralised identity vault secured by blockchain and end-to-end
            encryption. Your data lives on IPFS — not on any central server.
          </p>
        </div>
        <div className="auth-features">
          <div className="auth-feature"><span className="auth-feature-dot" />AES-256 encrypted at rest</div>
          <div className="auth-feature"><span className="auth-feature-dot" />IPFS distributed storage</div>
          <div className="auth-feature"><span className="auth-feature-dot" />Immutable blockchain record</div>
          <div className="auth-feature"><span className="auth-feature-dot" />Zero central authority</div>
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h1 className="auth-form-title">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="auth-form-subtitle">
              {mode === 'login'
                ? 'Access your identity vault'
                : 'Register your sovereign identity'}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-note">
            {mode === 'login' ? 'No account? ' : 'Have an account? '}
            <span
              style={{ color: 'var(--brass)', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
