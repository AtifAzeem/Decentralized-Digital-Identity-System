import { useState } from 'react';
import { addData } from '../services/api';
import '../styles/setup.css';

const EMPTY = {
  name: '', dob: '', gender: '',
  phone: '',
  street: '', city: '', state: '', pincode: '', country: ''
};

export default function SetupPage({ userId, onComplete }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.dob || !form.phone) {
      setError('Name, date of birth and phone are required.');
      return;
    }
    setLoading(true);
    try {
      const data = {
        personal: { name: form.name, dob: form.dob, gender: form.gender },
        contact: { phone: form.phone },
        address: {
          street: form.street, city: form.city,
          state: form.state, pincode: form.pincode, country: form.country
        }
      };
      await addData(userId, 'MAIN', data);
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-root">
      <div className="setup-header">
        <div className="setup-header-brand">⬡ DecentralID</div>
        <div className="setup-header-step">Step 1 of 1 — Identity Setup</div>
      </div>

      <div className="setup-body">
        <div className="setup-card">
          <div className="setup-card-header">
            <div className="setup-card-title">Primary Identity Record</div>
            <div className="setup-card-desc">This information will be encrypted and stored on IPFS via blockchain</div>
          </div>

          <div className="setup-card-body">
            {/* Personal */}
            <div className="setup-section">
              <div className="setup-section-label">Personal Information</div>
              <div className="setup-grid setup-grid-3">
                <div className="setup-field">
                  <label>Full Name</label>
                  <input placeholder="e.g. Atif Azeem" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="setup-field">
                  <label>Date of Birth</label>
                  <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                </div>
                <div className="setup-field">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="setup-section">
              <div className="setup-section-label">Contact</div>
              <div className="setup-grid setup-grid-2">
                <div className="setup-field">
                  <label>Phone Number</label>
                  <input placeholder="e.g. 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="setup-section">
              <div className="setup-section-label">Address</div>
              <div className="setup-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="setup-field">
                  <label>Street</label>
                  <input placeholder="e.g. 123 Main Street" value={form.street} onChange={e => set('street', e.target.value)} />
                </div>
              </div>
              <div className="setup-grid setup-grid-3" style={{ marginTop: '1rem' }}>
                <div className="setup-field">
                  <label>City</label>
                  <input placeholder="Delhi" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div className="setup-field">
                  <label>State</label>
                  <input placeholder="Delhi" value={form.state} onChange={e => set('state', e.target.value)} />
                </div>
                <div className="setup-field">
                  <label>Pincode</label>
                  <input placeholder="110001" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
                </div>
              </div>
              <div className="setup-grid setup-grid-2" style={{ marginTop: '1rem' }}>
                <div className="setup-field">
                  <label>Country</label>
                  <input placeholder="India" value={form.country} onChange={e => set('country', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {error && <div className="setup-error">{error}</div>}

          <div className="setup-card-footer">
            <div className="setup-footer-note">
              {loading ? '⟳ Encrypting & writing to blockchain…' : 'Data encrypted client-side before upload'}
            </div>
            <button className="setup-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving…' : 'Save & Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
