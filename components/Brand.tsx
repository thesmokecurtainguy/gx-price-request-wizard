export default function BrandHeader() {
  return (
    <header className="mb-6">
      <div className="h-1 w-24 bg-[var(--brand-red)] rounded"></div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="tracking-wider font-semibold text-[var(--brand-red)]">STÖBICH</span>
        <span className="text-sm text-gray-500">GX Price Request Wizard</span>
      </div>
    </header>
  );
}
