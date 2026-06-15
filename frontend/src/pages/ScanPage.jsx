import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { policeAccess, medicalAccess } from '../services/api';
import '../styles/scan.css';

const CONFIG = {
  police:  { label: 'Police Access',  emoji: '🚔', color: '#2563eb' },
  medical: { label: 'Medical Access', emoji: '🏥', color: '#059669' },
};

export default function ScanPage({ mode }) {
  const cfg = CONFIG[mode];

  const html5QrRef  = useRef(null);
  const hasScanned  = useRef(false);  // ← gate: only process one scan ever

  const [status, setStatus] = useState('scanning');
  const [errMsg, setErrMsg] = useState('');
  const [data,   setData]   = useState(null);

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function startScanner() {
    hasScanned.current = false;
    try {
      const qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onScanSuccess,
        () => {}
      );
    } catch {
      setErrMsg('Camera permission denied or not available.');
      setStatus('error');
    }
  }

  async function stopScanner() {
    try {
      if (html5QrRef.current) {
        await html5QrRef.current.stop();
        html5QrRef.current = null;
      }
    } catch (_) {}
  }

  async function onScanSuccess(raw) {
    // html5-qrcode fires this callback on every frame it detects a QR —
    // this ref ensures we only act on the very first hit
    if (hasScanned.current) return;
    hasScanned.current = true;

    await stopScanner();
    setStatus('fetching');

    let userId;
    try {
      const parsed = JSON.parse(raw);
      userId = parsed.userId;
      if (!userId) throw new Error();
    } catch {
      setErrMsg('QR code is invalid. Expected { "userId": "..." }');
      setStatus('error');
      return;
    }

    try {
      const res = mode === 'police'
        ? await policeAccess(userId)
        : await medicalAccess(userId);
      setData(res);
      setStatus('done');
    } catch (err) {
      setErrMsg(err.message || 'Failed to fetch data.');
      setStatus('error');
    }
  }

  async function retry() {
    setData(null);
    setErrMsg('');
    setStatus('scanning');
    await startScanner();
  }

  return (
    <div className="scan-shell">
      <div className="scan-header" style={{ '--accent': cfg.color }}>
        <span className="scan-emoji">{cfg.emoji}</span>
        <div>
          <div className="scan-title">{cfg.label}</div>
          <div className="scan-subtitle">DecentralID</div>
        </div>
      </div>

      {/* Always in DOM so html5-qrcode can attach — hidden when not scanning */}
      <div className={`scan-camera-wrap ${status !== 'scanning' ? 'hidden' : ''}`}>
        <div id="qr-reader" />
        <div className="scan-overlay">
          <div className="scan-frame" />
        </div>
        <div className="scan-hint">Point at a DecentralID QR code</div>
      </div>

      {status === 'fetching' && (
        <div className="scan-state">
          <div className="scan-spinner" />
          <p>Fetching data…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="scan-state">
          <div className="scan-icon-circle" style={{ background: '#fee2e2', color: '#dc2626' }}>✕</div>
          <p className="scan-err-msg">{errMsg}</p>
          <button className="scan-btn" onClick={retry}>Try again</button>
        </div>
      )}

      {status === 'done' && data && (
        <div className="scan-results">
          {mode === 'police'
            ? <PoliceResults data={data} />
            : <MedicalResults data={data} />}
          <button className="scan-btn scan-btn-outline" onClick={retry} style={{ marginTop: 24 }}>
            Scan another
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Result renderers ── */

function Card({ title, color = '#2563eb', children }) {
  return (
    <div className="res-card">
      <div className="res-card-title" style={{ color }}>{title}</div>
      <div className="res-card-body">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="res-row">
      <span className="res-label">{label}</span>
      <span className="res-value">{value}</span>
    </div>
  );
}

function Badges({ label, items }) {
  if (!items?.length) return null;
  return (
    <div className="res-row res-row-col">
      <span className="res-label">{label}</span>
      <div className="res-badges">
        {items.map((item, i) => <span key={i} className="res-badge">{item}</span>)}
      </div>
    </div>
  );
}

function PoliceResults({ data }) {
  const { main, trip } = data;
  return (
    <>
      {main && (
        <>
          <Card title="Personal" color="#2563eb">
            <Row label="Name"   value={main.personal?.name} />
            <Row label="DOB"    value={main.personal?.dob} />
            <Row label="Gender" value={main.personal?.gender} />
          </Card>
          <Card title="Contact & Address" color="#2563eb">
            <Row label="Phone"   value={main.contact?.phone} />
            <Row label="Street"  value={main.address?.street} />
            <Row label="City"    value={main.address?.city} />
            <Row label="State"   value={main.address?.state} />
            <Row label="Pincode" value={main.address?.pincode} />
          </Card>
        </>
      )}
      {trip && (
        <>
          <Card title="Travel" color="#7c3aed">
            <Row label="Destination" value={trip.travel?.destination} />
            <Row label="Purpose"     value={trip.travel?.purpose} />
            <Row label="Start"       value={trip.schedule?.startDate} />
            <Row label="End"         value={trip.schedule?.endDate} />
          </Card>
          <Card title="Transport & Stay" color="#7c3aed">
            <Row label="Mode"       value={trip.transport?.mode} />
            <Row label="Booking ID" value={trip.transport?.bookingId} />
            <Row label="Hotel"      value={trip.stay?.hotelName} />
            <Row label="Address"    value={trip.stay?.address} />
          </Card>
        </>
      )}
      {!main && !trip && <EmptyState />}
    </>
  );
}

function MedicalResults({ data }) {
  const { main, medical } = data;
  return (
    <>
      {main && (
        <Card title="Personal" color="#059669">
          <Row label="Name"   value={main.personal?.name} />
          <Row label="DOB"    value={main.personal?.dob} />
          <Row label="Gender" value={main.personal?.gender} />
          <Row label="Phone"  value={main.contact?.phone} />
        </Card>
      )}
      {medical && (
        <>
          <Card title="Health" color="#059669">
            <Row label="Blood Group" value={medical.health?.bloodGroup} />
            <Badges label="Allergies" items={medical.health?.allergies} />
          </Card>
          {medical.medications?.length > 0 && (
            <Card title="Medications" color="#059669">
              {medical.medications.map((m, i) => (
                <div key={i} className="med-block">
                  <Row label="Name"      value={m.name} />
                  <Row label="Dosage"    value={m.dosage} />
                  <Row label="Frequency" value={m.frequency} />
                  {i < medical.medications.length - 1 && <div className="med-divider" />}
                </div>
              ))}
            </Card>
          )}
          <Card title="Doctor" color="#059669">
            <Row label="Name"     value={medical.doctor?.name} />
            <Row label="Hospital" value={medical.doctor?.hospital} />
            <Row label="Phone"    value={medical.doctor?.phone} />
          </Card>
          <Card title="Emergency Contact" color="#dc2626">
            <Row label="Name"     value={medical.emergency?.contactName} />
            <Row label="Relation" value={medical.emergency?.relation} />
            <Row label="Phone"    value={medical.emergency?.phone} />
          </Card>
        </>
      )}
      {!main && !medical && <EmptyState />}
    </>
  );
}

function EmptyState() {
  return (
    <div className="scan-state">
      <div className="scan-icon-circle" style={{ background: '#fef9c3', color: '#ca8a04' }}>!</div>
      <p>No data found for this user.</p>
    </div>
  );
}