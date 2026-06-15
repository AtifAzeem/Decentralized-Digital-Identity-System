import { useState } from 'react';
import { InfoCard, FieldRow } from './InfoCard';
import { addData } from '../services/api';

const EMPTY = { destination:'', purpose:'', startDate:'', endDate:'', mode:'', bookingId:'', hotelName:'', stayAddress:'' };

export default function TripView({ data, userId, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(''); setSuccess(false);
    if (!form.destination) { setError('Destination is required.'); return; }
    setLoading(true);
    try {
      const payload = {
        travel:    { destination: form.destination, purpose: form.purpose },
        schedule:  { startDate: form.startDate, endDate: form.endDate },
        transport: { mode: form.mode, bookingId: form.bookingId },
        stay:      { hotelName: form.hotelName, address: form.stayAddress }
      };
      await addData(userId, 'TRIP', payload);
      setSuccess(true); setForm(EMPTY); onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      {data ? (
        <div className="card-grid">
          <InfoCard iconClass="card-icon-navy" iconLabel="→" title="Travel">
            <FieldRow label="Destination" value={data.travel?.destination} />
            <FieldRow label="Purpose"     value={data.travel?.purpose} />
          </InfoCard>
          <InfoCard iconClass="card-icon-teal" iconLabel="◷" title="Schedule">
            <FieldRow label="Start date" value={data.schedule?.startDate} />
            <FieldRow label="End date"   value={data.schedule?.endDate} />
          </InfoCard>
          <InfoCard iconClass="card-icon-amber" iconLabel="⇌" title="Transport">
            <FieldRow label="Mode"       value={data.transport?.mode} />
            <FieldRow label="Booking ID" value={data.transport?.bookingId} />
          </InfoCard>
          <InfoCard iconClass="card-icon-purple" iconLabel="⌂" title="Stay">
            <FieldRow label="Hotel"   value={data.stay?.hotelName} />
            <FieldRow label="Address" value={data.stay?.address} />
          </InfoCard>
        </div>
      ) : (
        <div className="no-data">
          <strong>No trip record</strong>
          <span>Add your travel details below.</span>
        </div>
      )}

      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-title">Update trip record</span>
          <span className="form-card-note">Encrypted → IPFS → Blockchain</span>
        </div>
        <div className="form-card-body">
          <div className="form-section">
            <div className="form-section-label">Travel</div>
            <div className="form-grid form-grid-2">
              <div className="form-field"><label>Destination</label><input value={form.destination} onChange={e=>set('destination',e.target.value)} placeholder="Goa" /></div>
              <div className="form-field"><label>Purpose</label><input value={form.purpose} onChange={e=>set('purpose',e.target.value)} placeholder="Vacation" /></div>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-label">Schedule</div>
            <div className="form-grid form-grid-2">
              <div className="form-field"><label>Start date</label><input type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} /></div>
              <div className="form-field"><label>End date</label><input type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} /></div>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-label">Transport</div>
            <div className="form-grid form-grid-2">
              <div className="form-field"><label>Mode</label>
                <select value={form.mode} onChange={e=>set('mode',e.target.value)}>
                  <option value="">Select</option>
                  <option>Flight</option><option>Train</option><option>Bus</option><option>Car</option><option>Ship</option>
                </select>
              </div>
              <div className="form-field"><label>Booking ID</label><input value={form.bookingId} onChange={e=>set('bookingId',e.target.value)} placeholder="FL12345" /></div>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-label">Stay</div>
            <div className="form-grid form-grid-2">
              <div className="form-field"><label>Hotel name</label><input value={form.hotelName} onChange={e=>set('hotelName',e.target.value)} /></div>
              <div className="form-field"><label>Address</label><input value={form.stayAddress} onChange={e=>set('stayAddress',e.target.value)} /></div>
            </div>
          </div>
        </div>
        {error && <div style={{padding:'0 16px 12px'}}><span className="form-error">{error}</span></div>}
        <div className="form-footer">
          {success && <span className="form-success">✓ Saved to blockchain</span>}
          <button className="form-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Save Record →'}
          </button>
        </div>
      </div>
    </>
  );
}
