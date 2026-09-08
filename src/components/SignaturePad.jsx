import { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Check, ShieldCheck } from 'lucide-react';
import { DEFAULT_MANAGER_SIG } from '../utils/constants.js';

export default function SignaturePad({ value, onChange, label = "Digital Signature", required = true }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const isUsingDefault = value === DEFAULT_MANAGER_SIG;
  const hasSignature = Boolean(value);

  // Initialize and synchronize canvas DOM
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Scale for high-DPI screens
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = (rect.width || 450) * ratio;
    canvas.height = 140 * ratio;
    ctx.scale(ratio, ratio);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.2;

    if (value && (value.startsWith('data:') || value.startsWith('http'))) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 15, (rect.width || 450) - 40, 110);
      };
      img.src = value;
    } else if (!value) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    if (onChange) {
      onChange(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onChange) {
      onChange('');
    }
  };

  const handleUseDefault = () => {
    if (onChange) {
      onChange(DEFAULT_MANAGER_SIG);
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <label className="form-label">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <PenTool size={16} color="var(--brand-gold-dark)" />
            {label}
            {required && <span className="required">*</span>}
          </span>
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleUseDefault}
            className="btn btn-outline-gold btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            <ShieldCheck size={13} />
            Use Authorized Default
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            <RotateCcw size={13} />
            Clear
          </button>
        </div>
      </div>

      <div style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        border: hasSignature ? '2px solid var(--brand-black)' : '2px dashed var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '140px', display: 'block', touchAction: 'none', cursor: 'crosshair' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Guide line */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '20px',
          right: '20px',
          borderBottom: '1.5px dotted #9ca3af',
          pointerEvents: 'none'
        }} />

        {!hasSignature && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}>
            <span>Sign here using finger or mouse</span>
          </div>
        )}

        {isUsingDefault && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'var(--brand-gold-light)',
            color: 'var(--brand-gold-dark)',
            border: '1px solid var(--brand-gold-border)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Check size={12} />
            Authorized Signature Applied
          </div>
        )}
      </div>
      <span className="form-hint">
        Sign above or apply default authorized management signature.
      </span>
    </div>
  );
}
