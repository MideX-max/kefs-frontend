import { CheckCircle2, Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || 'Pending Review').toLowerCase();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  };

  switch (normalized) {
    case 'approved':
      return (
        <span className={`badge badge-approved ${sizeClasses[size]}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    case 'active':
      return (
        <span className={`badge badge-active ${sizeClasses[size]}`}>
          <CheckCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Active Pass
        </span>
      );
    case 'upcoming':
      return (
        <span className={`badge badge-upcoming ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Upcoming
        </span>
      );
    case 'pending review':
    case 'pending':
    case 'requires review':
      return (
        <span className={`badge badge-pending ${sizeClasses[size]}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Requires Review
        </span>
      );
    case 'expired':
      return (
        <span className={`badge badge-expired ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          Expired
        </span>
      );
    case 'rejected':
      return (
        <span className={`badge badge-rejected ${sizeClasses[size]}`}>
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`badge badge-expired ${sizeClasses[size]}`}>
          {status}
        </span>
      );
  }
}
