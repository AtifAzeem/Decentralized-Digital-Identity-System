import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRModal({ userId, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && userId) {
      // ✅ Encode as JSON (FIX)
      const qrData = JSON.stringify({ userId });

      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 220,
        margin: 1,
        color: { dark: '#0f1f38', light: '#ffffff' },
      });
    }
  }, [userId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `decentralid-${userId.slice(0, 8)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-title">Identity QR Code</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="qr-canvas-wrap">
            <canvas ref={canvasRef} />
          </div>

          <div className="qr-uid">{userId}</div>

          <p className="qr-note">
            Scan to retrieve this identity record via any DecentralID-compatible verifier.
          </p>

          <button className="qr-download" onClick={handleDownload}>
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}