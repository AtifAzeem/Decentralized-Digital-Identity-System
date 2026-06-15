import { useState } from 'react';
import { InfoCard, FieldRow } from './InfoCard';
import { addData } from '../services/api';

const EMPTY = { name:'', dob:'', gender:'', phone:'', street:'', city:'', state:'', pincode:'', country:'' };

export default function MainView({ data, userId, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(''); setSuccess(false);
    if (!form.name) { setError('Name is required.'); return; }
    setLoading(true);
    try {
      const payload = {
        personal: { name: form.name, dob: form.dob, gender: form.gender },
        contact:  { phone: form.phone },
        address:  { street: form.street, city: form.city, state: form.state, pincode: form.pincode, country: form.country }
      };
      await addData(userId, 'MAIN', payload);
      setSuccess(true);
      setForm(EMPTY);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {data ? (
        <div className="card-grid">
          <InfoCard iconClass="card-icon-navy" iconLabel="✦" title="Personal">
            <FieldRow label="Full name"     value={data.personal?.name} />
            <FieldRow label="Date of birth" value={data.personal?.dob} />
            <FieldRow label="Gender"        value={data.personal?.gender} />
          </InfoCard>
          <InfoCard iconClass="card-icon-teal" iconLabel="✆" title="Contact">
            <FieldRow label="Phone" value={data.contact?.phone} />
          </InfoCard>
          <InfoCard iconClass="card-icon-amber" iconLabel="⌂" title="Address">
            <FieldRow label="Street"  value={data.address?.street} />
            <FieldRow label="City"    value={data.address?.city} />
            <FieldRow label="State"   value={data.address?.state} />
            <FieldRow label="Pincode" value={data.address?.pincode} />
            <FieldRow label="Country" value={data.address?.country} />
          </InfoCard>
        </div>
      ) : (
        <div className="no-data">
          <strong>No identity record</strong>
          <span>Fill the form below to create one.</span>
        </div>
      )}

      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-title">Update identity record</span>
          <span className="form-card-note">Encrypted → IPFS → Blockchain</span>
        </div>
        <div className="form-card-body">
          <div className="form-section">
            <div className="form-section-label">Personal</div>
            <div className="form-grid form-grid-3">
              <div className="form-field"><label>Full name</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Atif Azeem" /></div>
              <div className="form-field"><label>Date of birth</label><input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></div>
              <div className="form-field"><label>Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-label">Contact</div>
            <div className="form-grid form-grid-2">
              <div className="form-field"><label>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" /></div>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-label">Address</div>
            <div className="form-grid" style={{gridTemplateColumns:'1fr'}}>
              <div className="form-field"><label>Street</label><input value={form.street} onChange={e => set('street', e.target.value)} placeholder="123 Main Street" /></div>
            </div>
            <div className="form-grid form-grid-3" style={{marginTop:'10px'}}>
              <div className="form-field"><label>City</label><input value={form.city} onChange={e => set('city', e.target.value)} /></div>
              <div className="form-field"><label>State</label><input value={form.state} onChange={e => set('state', e.target.value)} /></div>
              <div className="form-field"><label>Pincode</label><input value={form.pincode} onChange={e => set('pincode', e.target.value)} /></div>
            </div>
            <div className="form-grid form-grid-2" style={{marginTop:'10px'}}>
              <div className="form-field"><label>Country</label><input value={form.country} onChange={e => set('country', e.target.value)} /></div>
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
