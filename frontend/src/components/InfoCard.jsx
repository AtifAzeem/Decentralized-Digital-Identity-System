export function InfoCard({ iconClass, iconLabel, title, children }) {
  return (
    <div className="info-card">
      <div className="card-head">
        <div className="card-head-left">
          <div className={`card-icon ${iconClass}`}>{iconLabel}</div>
          <span className="card-title">{title}</span>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export function FieldRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="field-row">
      <span className="field-key">{label}</span>
      <span className="field-val">{value}</span>
    </div>
  );
}

export function BadgeList({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="field-key" style={{ marginBottom: 5 }}>{label}</div>
      <div className="badge-list">
        {items.map((item, i) => <span key={i} className="badge">{item}</span>)}
      </div>
    </div>
  );
}
