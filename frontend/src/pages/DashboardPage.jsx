import { useState, useEffect, useRef } from 'react';
import { getData } from '../services/api';
import MainView    from '../components/MainView';
import MedicalView from '../components/MedicalView';
import TripView    from '../components/TripView';
import QRModal     from '../components/QRModal';
import '../styles/dashboard.css';

const TABS = [
  { key: 'MAIN',    label: 'Identity', icon: '✦' },
  { key: 'MEDICAL', label: 'Medical',  icon: '✚' },
  { key: 'TRIP',    label: 'Trip',     icon: '→' },
];

const TAB_TITLES = { MAIN: 'Identity', MEDICAL: 'Medical', TRIP: 'Trip' };

export default function DashboardPage({ userId, onLogout }) {
  const [activeTab, setActiveTab]   = useState('MAIN');
  const [cache, setCache]           = useState({});
  const [loading, setLoading]       = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [showQR, setShowQR]         = useState(false);
  const [lastTx, setLastTx]         = useState(null);

  const fetched    = useRef(new Set());
  const inFlight   = useRef(new Set()); // prevent concurrent duplicate calls

  async function fetchTab(type) {
    if (fetched.current.has(type)) return;   // already cached
    if (inFlight.current.has(type)) return;  // already in progress

    inFlight.current.add(type);
    setLoading(true);
    setFetchError('');
    try {
      const res = await getData(userId, type);
      setCache(prev => ({ ...prev, [type]: res.data }));
      if (res.cid) setLastTx(res.cid);
      fetched.current.add(type);
    } catch (err) {
      if (err.message.toLowerCase().includes('no data') || err.message.toLowerCase().includes('blockchain')) {
        setCache(prev => ({ ...prev, [type]: null }));
        fetched.current.add(type); // mark as fetched even on "no data"
      } else {
        setFetchError(err.message);
      }
    } finally {
      inFlight.current.delete(type);
      setLoading(false);
    }
  }

  // only re-run when activeTab changes — no fetchTab in deps to avoid loop
  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSaved(type) {
    fetched.current.delete(type);
    setCache(prev => ({ ...prev, [type]: undefined }));
    fetchTab(type);
  }

  const shortId    = userId ? `${userId.slice(0, 8)}…` : '';
  const initials   = (userId || 'ID').slice(0, 2).toUpperCase();
  const recordCount = Object.values(cache).filter(v => v !== undefined && v !== null).length;

  return (
    <div className="dash-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <div className="sb-hex">⬡</div>
            <span className="sb-name">DecentralID</span>
          </div>
          <div className="sb-tagline">Sovereign Identity</div>
        </div>

        <div className="sb-user">
          <div className="sb-avatar">{initials}</div>
          <div>
            <div className="sb-uname">Identity Holder</div>
            <div className="sb-uid">uid: {shortId}</div>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-label">Records</div>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`sb-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <div className={`sb-icon ${activeTab === tab.key ? 'sb-icon-active' : 'sb-icon-default'}`}>
                {tab.icon}
              </div>
              <span className="sb-item-label">{tab.label}</span>
              {cache[tab.key] && <span className="sb-badge">ON</span>}
            </button>
          ))}

          <div className="sb-divider" />
          <div className="sb-section-label">Tools</div>

          <button className="sb-item" onClick={() => setShowQR(true)}>
            <div className="sb-icon sb-icon-default">▣</div>
            <span className="sb-item-label">QR Code</span>
          </button>
        </nav>

        <div className="sb-bottom">
          <button className="sb-logout" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dash-main">
        <div className="topbar">
          <span className="topbar-crumb">Dashboard</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-title">{TAB_TITLES[activeTab]}</span>
          <div className="topbar-right">
            <div className="chain-badge">
              <div className="chain-dot" />
              <span className="chain-text">Chain connected</span>
            </div>
            {lastTx && <div className="cid-pill" title={lastTx}>{lastTx.slice(0, 20)}…</div>}
          </div>
        </div>

        <div className="dash-content">
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">Records stored</div>
              <div className="stat-value">{recordCount}</div>
              <div className="stat-sub">
                <span className="stat-dot" style={{ background: '#1D9E75' }} />
                verified on-chain
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Storage</div>
              <div className="stat-value" style={{ fontSize: '15px', marginTop: '3px' }}>IPFS</div>
              <div className="stat-sub">
                <span className="stat-dot" style={{ background: 'var(--brass)' }} />
                distributed
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Encryption</div>
              <div className="stat-value" style={{ fontSize: '15px', marginTop: '3px' }}>AES-256</div>
              <div className="stat-sub">
                <span className="stat-dot" style={{ background: '#7F77DD' }} />
                end-to-end
              </div>
            </div>
          </div>

          {lastTx && (
            <div className="bc-strip">
              <span className="bc-label">IPFS CID</span>
              <span className="bc-hash">{lastTx}</span>
              <div className="bc-confirm">
                <span className="bc-tick">✓</span>
                <span className="bc-confirm-text">pinned</span>
              </div>
            </div>
          )}

          {fetchError && (
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #f5c6cb', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
              {fetchError}
            </div>
          )}

          {loading ? (
            <div className="dash-loading">
              <div className="spinner" />
              Fetching from IPFS via blockchain…
            </div>
          ) : (
            <>
              {activeTab === 'MAIN'    && <MainView    data={cache['MAIN']}    userId={userId} onSaved={() => handleSaved('MAIN')} />}
              {activeTab === 'MEDICAL' && <MedicalView data={cache['MEDICAL']} userId={userId} onSaved={() => handleSaved('MEDICAL')} />}
              {activeTab === 'TRIP'    && <TripView    data={cache['TRIP']}    userId={userId} onSaved={() => handleSaved('TRIP')} />}
            </>
          )}
        </div>
      </div>

      {showQR && <QRModal userId={userId} onClose={() => setShowQR(false)} />}
    </div>
  );
}
