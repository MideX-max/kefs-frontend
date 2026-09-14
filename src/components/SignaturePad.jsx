import { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool } from 'lucide-react';

export default function SignaturePad({ value, onChange, label = "Digital Signature", required = true }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const hasSignature = Boolean(value);

  const lastDrawnUrlRef = useRef('');

  // 1. Initialize canvas dimensions once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 450;

    canvas.width = width * ratio;
    canvas.height = 140 * ratio;

    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.2;
  }, []);

  // 2. Load value from props if changed externally (and not matching lastDrawnUrlRef)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip if value matches what was just drawn locally
    if (value === lastDrawnUrlRef.current) return;

    const ctx = canvas.getContext('2d');
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 450;

    if (value && (value.startsWith('data:') || value.startsWith('http'))) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, width, 140);
        ctx.drawImage(img, 20, 15, width - 40, 110);
      };
      img.src = value;
      lastDrawnUrlRef.current = value;
    } else if (!value) {
      ctx.clearRect(0, 0, width, 140);
      lastDrawnUrlRef.current = '';
    }
  }, [value]);

  // Bind native non-passive touch listeners to eliminate passive listener warnings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let drawing = false;

    const handleTouchStart = (e) => {
      if (e.cancelable) e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
      drawing = true;
      setIsDrawing(true);
    };

    const handleTouchMove = (e) => {
      if (!drawing) return;
      if (e.cancelable) e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const ctx = canvas.getContext('2d');
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
      ctx.stroke();
    };

    const handleTouchEnd = (e) => {
      if (!drawing) return;
      if (e.cancelable) e.preventDefault();
      drawing = false;
      setIsDrawing(false);
      const dataUrl = canvas.toDataURL('image/png');
      lastDrawnUrlRef.current = dataUrl;
      if (onChange) {
        onChange(dataUrl);
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onChange]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startMouseDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const mouseDraw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopMouseDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    lastDrawnUrlRef.current = dataUrl;
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
          onMouseDown={startMouseDrawing}
          onMouseMove={mouseDraw}
          onMouseUp={stopMouseDrawing}
          onMouseLeave={stopMouseDrawing}
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
      </div>
      <span className="form-hint">
        Sign above using your finger or mouse cursor.
      </span>
    </div>
  );
}
