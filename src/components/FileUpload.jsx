import { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle, X, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';

export default function FileUpload({ 
  label = "Upload Identification Document", 
  hint = "Accepts NIN Slip, International Passport, Driver's License (PDF, PNG, JPG up to 10MB)",
  required = true, 
  value, 
  fileName, 
  onChange, 
  accept = "image/*,application/pdf",
  isPhoto = false,
  kind = "id-document",
  publicId = "",
  resourceType = "image"
}) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  // Drop the previous Cloudinary asset so replaced files do not accumulate.
  const discardPrevious = async () => {
    if (!publicId) return;
    try {
      await api.deleteUpload(publicId, resourceType);
    } catch (err) {
      // A file that is already attached to a saved reservation is kept on
      // purpose; nothing here should block the guest.
      console.warn('Could not remove the previous upload:', err.message);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.uploadFile(file, kind);
      await discardPrevious();
      onChange({
        url: res.fileUrl,
        name: res.fileName,
        size: res.fileSize,
        type: res.mimetype,
        publicId: res.publicId,
        resourceType: res.resourceType
      });
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = '';
    await discardPrevious();
    onChange({ url: '', name: '', size: 0, type: '', publicId: '', resourceType: '' });
    setError('');
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label className="form-label">
        {label} {required && <span className="required">*</span>}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div style={{
          border: '1.5px solid #10b981',
          backgroundColor: '#f0fdf4',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
            {value.startsWith('data:image') || value.endsWith('.png') || value.endsWith('.jpg') || value.endsWith('.jpeg') || isPhoto ? (
              <img
                src={value}
                alt="Document preview"
                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            ) : (
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} color="#475569" />
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#065f46', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fileName || "Verified Document"}
                </span>
                <CheckCircle size={15} color="#10b981" />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                {fileName ? "Ready for verification" : "Document attached successfully"}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <RefreshCw size={12} />
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="btn btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', backgroundColor: '#fee2e2', color: '#dc2626' }}
              title="Remove File"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: dragActive ? '2px solid var(--brand-gold)' : '2px dashed var(--border-medium)',
            backgroundColor: dragActive ? 'var(--brand-gold-subtle)' : 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', border: '3px solid var(--brand-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Processing document...</span>
            </div>
          ) : (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--brand-gold-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                {isPhoto ? <ImageIcon size={24} color="var(--brand-gold-dark)" /> : <UploadCloud size={24} color="var(--brand-gold-dark)" />}
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--brand-black)', marginBottom: '0.25rem' }}>
                Click to browse or drag and drop document
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {hint}
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <span className="form-error" style={{ display: 'block', marginTop: '0.5rem' }}>
          {error}
        </span>
      )}
    </div>
  );
}
