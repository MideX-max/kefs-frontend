export default function Logo({ className = '', height = 54 }) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src="/logo.png"
        alt="KEFFI APARTMENT SUITES"
        style={{ height: `${height}px`, width: 'auto' }}
        className="object-contain transition-transform duration-200"
        onError={(e) => {
          // Fallback if image path needs asset resolver
          e.currentTarget.src = '/logo.png';
        }}
      />
    </div>
  );
}
