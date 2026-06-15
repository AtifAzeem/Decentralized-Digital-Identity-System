import { useState } from 'react';
import { InfoCard, FieldRow, BadgeList } from './InfoCard';
import { addData } from '../services/api';

const EMPTY_MED = { name:'', dosage:'', frequency:'' };
const EMPTY = { bloodGroup:'', allergies:'', medications:[{...EMPTY_MED}], doctorName:'', hospital:'', doctorPhone:'', emergencyName:'', relation:'', emergencyPhone:'' };

export default function MedicalView({ data, userId, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setMed = (i, field, val) => setForm(f => ({ ...f, medications: f.medications.map((m, idx) => idx === i ? {...m, [field]: val} : m) }));
  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, {...EMPTY_MED}] }));
  const removeMed = i => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    setError(''); setSuccess(false);
    setLoading(true);
    try {
      const payload = {
        health: { bloodGroup: form.bloodGroup, allergies: form.allergies ? form.allergies.split(',').map(s=>s.trim()).filter(Boolean) : [] },
        medications: form.medications.filter(m => m.name),
        doctor: { name: form.doctorName, hospital: form.hospital, phone: form.doctorPhone },
        emergency: { contactName: form.emergencyName, relation: form.relation, phone: form.emergencyPhone }
      };
      await addData(userId, 'MEDICAL', payload);
      setSuccess(true); setForm(EMPTY); onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      {data ? (
        <div className="card-grid">
          <InfoCard iconClass="card-icon-red" iconLabel="♥" title="Health">
            <FieldRow label="Blood group" value={data.health?.bloodGroup} />
            <BadgeList label="Allergies" items={data.health?.allergies} />
          </InfoCard>

          <InfoCard iconClass="card-icon-purple" iconLabel="✚" title="Medications">
            {data.medications?.length > 0 ? data.medications.map((m,i) => (
              <div key={i} className="med-item">
                <div><div className="med-sub-label">Name</div><div className="med-sub-val">{m.name}</div></div>
                <div><div className="med-sub-label">Dosage</div><div className="med-sub-val">{m.dosage}</div></div>
                <div><div className="med-sub-label">Frequency</div><div className="med-sub-val">{m.frequency}</div></div>
              </div>
            )) : <span style={{fontSize:'12px',color:'var(--slate-light)'}}>None listed</span>}
          </InfoCard>

          <InfoCard iconClass="card-icon-teal" iconLabel="✦" title="Doctor">
            <FieldRow label="Name"     value={data.doctor?.name} />
            <FieldRow label="Hospital" value={data.doctor?.hospital} />
            <FieldRow label="Phone"    value={data.doctor?.phone} />
          </InfoCard>

          <InfoCard iconClass="card-icon-amber" iconLabel="!" title="Emergency">
            <FieldRow label="Name"     value={data.emergency?.contactName} />
            <FieldRow label="Relation" value={data.emergency?.relation} />
            <FieldRow label="Phone"    value={data.emergency?.phone} />
          </InfoCard>
        </div>
      ) : (
        <div className="no-data">
          <strong>No medical record</strong>
          <span>Add your medical information below.</span>
        </div>
      )}

      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-title">Update medical record</span>
          <span className="form-card-note">Encrypted → IPFS → Blockchain</span>
        </div>
        <div className="form-card-body">
          <div className="form-section">
            <div className="form-section-label">Health</div>
            <div className="form-grid form-grid-2">
              <div className="form-field"><label>Blood group</label>
                <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-field"><label>Allergies (comma separated)</label><input value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="dust, peanuts" /></div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-label">Medications</div>
            {form.medications.map((m,i) => (
              <div key={i} className="med-row">
                <input placeholder="Medicine" value={m.name}      onChange={e => setMed(i,'name',e.target.value)} />
                <input placeholder="Dosage"   value={m.dosage}    onChange={e => setMed(i,'dosage',e.target.value)} />
                <input placeholder="Freq."    value={m.frequency} onChange={e => setMed(i,'frequency',e.target.value)} />
                <button className="btn-remove" onClick={() => removeMed(i)}>✕</button>
              </div>
            ))}
            <button className="btn-add-row" onClick={addMed}>+ Add medication</button>
          </div>

          <div className="form-section">
            <div className="form-section-label">Doctor</div>
            <div className="form-grid form-grid-3">
              <div className="form-field"><label>Name</label><input value={form.doctorName} onChange={e=>set('doctorName',e.target.value)} /></div>
              <div className="form-field"><label>Hospital</label><input value={form.hospital} onChange={e=>set('hospital',e.target.value)} /></div>
              <div className="form-field"><label>Phone</label><input value={form.doctorPhone} onChange={e=>set('doctorPhone',e.target.value)} /></div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-label">Emergency contact</div>
            <div className="form-grid form-grid-3">
              <div className="form-field"><label>Name</label><input value={form.emergencyName} onChange={e=>set('emergencyName',e.target.value)} /></div>
              <div className="form-field"><label>Relation</label><input value={form.relation} onChange={e=>set('relation',e.target.value)} /></div>
              <div className="form-field"><label>Phone</label><input value={form.emergencyPhone} onChange={e=>set('emergencyPhone',e.target.value)} /></div>
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
