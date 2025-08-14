'use client';
export default function Progress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm mb-1">
        <span>Step {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded">
        <div className="h-2 bg-[var(--brand-red)] rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
