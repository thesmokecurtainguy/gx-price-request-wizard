'use client';
import React from 'react';
import { useState } from 'react';
import Progress from '../components/Progress';
import BrandHeader from '../components/Brand';

function parseInches(input: string): number | null {
  if (!input) return null;
  const s = input.trim();
  const simple = /^\d+(?:\.\d+)?$/;
  if (simple.test(s)) return Number(s);
  const frac = /^(\d+)-(\d+)\/(\d+)$/; // 2-7/8  <-- note the slash
  const m = s.match(frac);
  if (m) {
    const whole = Number(m[1]);
    const num = Number(m[2]);
    const den = Number(m[3]);
    if (den === 0) return null;
    return whole + num / den;
  }
  return null;
}

function InchesHelper() {
  const [feet,setFeet] = useState('');
  const [inch,setInch] = useState('');
  const [num,setNum] = useState('');
  const [den,setDen] = useState('');
  const total = (()=>{
    const f = Number(feet||0);
    const i = Number(inch||0);
    const n = Number(num||0);
    const d = Number(den||0) || 1;
    const frac = n/d;
    return (f*12 + i + frac).toFixed(3);
  })();
  return (
    <div className="brand-card p-3 mt-2">
      <div className="text-sm font-medium mb-2">Feet→Inches Helper (manual)</div>
      <div className="grid grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-xs block">Feet</label>
          <input className="border p-2 rounded w-full" value={feet} onChange={e=>setFeet(e.target.value)} />
        </div>
        <div>
          <label className="text-xs block">Inches</label>
          <input className="border p-2 rounded w-full" value={inch} onChange={e=>setInch(e.target.value)} />
        </div>
        <div>
          <label className="text-xs block">Fraction (n/d)</label>
          <div className="flex gap-1">
            <input className="border p-2 rounded w-full" placeholder="n" value={num} onChange={e=>setNum(e.target.value)} />
            <span className="self-center">/</span>
            <input className="border p-2 rounded w-full" placeholder="d" value={den} onChange={e=>setDen(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs block">Total inches</label>
          <input className="border p-2 rounded w-full" value={total} readOnly />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Copy the total inches yourself; the form will not auto-fill.</p>
    </div>
  );
}

type ProjectInfo = {
  shippingZip: string;
  name: string;
  locationCity: string;
  locationState: string;
  generalContractor: string;
  architect: string;
};

type SubcontractorInfo = {
  company: string;
  salesperson: string;
  email: string;
  phone: string;
};

type Elevator = {
  floorsTotal: number;
  floorsWithCurtain: number[];
  clearWidthStr: string;
  clearHeightStr: string;
  frameWidthStr: string;
  frameProjectionStr: string;
  soffitHeightStr: string;
  curtainType: 'stub-rails' | 'aux-rails';
  preferredRailWidth?: 'auto' | '2' | '3.375' | '4';
  notes?: string;
};

export default function Page() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [project, setProject] = useState<ProjectInfo>({
    name: '', locationCity: '', locationState: '',
    generalContractor: '', architect: '', shippingZip: ''
  });
  const [subcontractor, setSubcontractor] = useState<SubcontractorInfo>({
    company: '', salesperson: '', email: '', phone: ''
  });
  const [elevatorsCount, setElevatorsCount] = useState<number>(1);
  const [elevators, setElevators] = useState<Elevator[]>([{
    floorsTotal: 1, floorsWithCurtain: [], clearWidthStr: '', clearHeightStr: '',
    frameWidthStr: '', frameProjectionStr: '', soffitHeightStr: '', curtainType: 'stub-rails', preferredRailWidth: 'auto', notes: ''
  }]);

  const [sizingTable, setSizingTable] = useState<any[]>([]);

  const canGoNext = () => {
    if (step === 1) {
      return project.name && project.locationCity && project.locationState && project.generalContractor && project.architect && project.shippingZip;
    }
    if (step === 2) {
      return subcontractor.company && subcontractor.salesperson && subcontractor.email && subcontractor.phone;
    }
    if (step === 3) {
      if (elevators.length < 1) return false;
      for (const e of elevators) {
        const cw = parseInches(e.clearWidthStr) ?? 0;
        const ch = parseInches(e.clearHeightStr) ?? 0;
        const fw = parseInches(e.frameWidthStr) ?? 0;
        const sh = parseInches(e.soffitHeightStr) ?? 0;
        if (!(e.floorsTotal > 0 && cw > 0 && ch > 0 && fw > 0 && sh > 0)) return false;
        if (e.floorsWithCurtain.length === 0) return false;
      }
      return true;
    }
    return true;
  };

  const setCount = (n: number) => {
    setElevatorsCount(n);
    setElevators(prev => {
      const copy = [...prev];
      if (n > prev.length) {
        while (copy.length < n) {
          copy.push({
            floorsTotal: 1, floorsWithCurtain: [], clearWidthStr: '', clearHeightStr: '',
            frameWidthStr: '', frameProjectionStr: '', soffitHeightStr: '', curtainType: 'stub-rails', preferredRailWidth: 'auto', notes: ''
          });
        }
      } else {
        copy.length = n;
      }
      return copy;
    });
  };

  const handleSubmit = async () => {
    const parsedElevators = elevators.map(e => ({
      floorsTotal: e.floorsTotal,
      floorsWithCurtain: e.floorsWithCurtain,
      clearWidth: parseInches(e.clearWidthStr) || 0,
      clearHeight: parseInches(e.clearHeightStr) || 0,
      frameWidth: parseInches(e.frameWidthStr) || 0,
      frameProjection: parseInches(e.frameProjectionStr) || 0,
      soffitHeight: parseInches(e.soffitHeightStr) || 0,
      curtainType: e.curtainType,
      preferredRailWidth: e.preferredRailWidth,
      notes: e.notes,
    }));
    const payload = { project, subcontractor, elevators: parsedElevators, sizingTable };
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setStep(4);
    } else {
      const err = await res.json().catch(() => ({}));
      alert('Error sending request: ' + (err?.error ? JSON.stringify(err.error) : 'Unknown error'));
    }
  };

  return (
    <main>
      <BrandHeader />
      <h1 className="brand-h1 mb-2">GX Price Request Wizard</h1>
      <p className="text-gray-600 mb-6">All dimensions must be entered in inches. For fractions, use a dash: <code>2-7/8</code> or <code>4-3/4</code> (not 4.75).</p>

      <Progress step={step} total={totalSteps} />

      {step === 1 && (
        <section className="space-y-4">
          <h2 className="brand-h2">Project Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Project Name" value={project.name} onChange={e => setProject({ ...project, name: e.target.value })} />
            <input className="border p-2 rounded" placeholder="City" value={project.locationCity} onChange={e => setProject({ ...project, locationCity: e.target.value })} />
            <input className="border p-2 rounded" placeholder="State" value={project.locationState} onChange={e => setProject({ ...project, locationState: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Shipping ZIP" value={project.shippingZip} onChange={e => setProject({ ...project, shippingZip: e.target.value })} />
            <input className="border p-2 rounded" placeholder="General Contractor (name/contact)" value={project.generalContractor} onChange={e => setProject({ ...project, generalContractor: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Architect (name/contact)" value={project.architect} onChange={e => setProject({ ...project, architect: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button disabled className="opacity-50 cursor-not-allowed brand-btn">Back</button>
            <button onClick={() => setStep(2)} disabled={!canGoNext()} className="brand-btn">Next</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <h2 className="brand-h2">Subcontractor Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Company Name" value={subcontractor.company} onChange={e => setSubcontractor({ ...subcontractor, company: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Salesperson Name" value={subcontractor.salesperson} onChange={e => setSubcontractor({ ...subcontractor, salesperson: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Email Address" value={subcontractor.email} onChange={e => setSubcontractor({ ...subcontractor, email: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Phone Number" value={subcontractor.phone} onChange={e => setSubcontractor({ ...subcontractor, phone: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="brand-btn">Back</button>
            <button onClick={() => setStep(3)} disabled={!canGoNext()} className="brand-btn">Next</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <h2 className="brand-h2">Elevator Information</h2>

          <div className="brand-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="brand-badge">Optional</div>
                <div className="mt-1 font-medium">Import sizing table (CSV)</div>
                <p className="text-sm text-gray-500">Use the template and I’ll map clear opening + frame dims + mount type → GX model on submit.</p>
              </div>
              <a href="/gx_sizing_template.csv" className="brand-btn" download>Download template</a>
            </div>
            <input type="file" accept=".csv" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const text = await f.text();
              const rows = text.split(/\r?\n/).filter(Boolean);
              const hdr = rows.shift()?.split(',').map(s=>s.trim()) || [];
              const out:any[] = [];
              for (const line of rows) {
                const cols = line.split(',').map(s=>s.trim());
                const obj:any = {};
                hdr.forEach((h,i)=>{ const v = cols[i]; if(v!==undefined && v!=='') obj[h] = isNaN(Number(v)) ? v : Number(v); });
                out.push(obj);
              }
              setSizingTable(out);
              alert(`Loaded ${out.length} rows from CSV.`);
            }} />
          </div>

          <InchesHelper />

          <div className="flex items-center gap-3">
            <label className="text-sm">Number of elevators</label>
            <input type="number" min={1} value={elevatorsCount} onChange={e => setCount(Number(e.target.value || 1))} className="border p-2 rounded w-28" />
          </div>

          <div className="space-y-8">
            {elevators.map((el, idx) => {
              const soffitNum = parseInches(el.soffitHeightStr) || 0;
              const over12ft = soffitNum > 144;
              return (
              <div key={idx} className="brand-card p-4">
                <h3 className="font-medium mb-3">Elevator {idx + 1}</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm block mb-1">Floors (total)</label>
                    <input type="number" min={1} className="border p-2 rounded w-full"
                      value={el.floorsTotal}
                      onChange={e => {
                        const v = Number(e.target.value || 1);
                        const copy = [...elevators];
                        copy[idx].floorsTotal = v;
                        setElevators(copy);
                      }} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm block mb-1">Floors with a smoke curtain (comma separated)</label>
                    <input className="border p-2 rounded w-full" placeholder="e.g., 1,2,3"
                      value={el.floorsWithCurtain.join(',')}
                      onChange={e => {
                        const nums = e.target.value.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
                        const copy = [...elevators];
                        copy[idx].floorsWithCurtain = nums;
                        setElevators(copy);
                      }} />
                  </div>

                  <div>
                    <label className="text-sm block mb-1">Clear Opening Width (inches) <span className="text-xs text-gray-500">(enter inches only; use 2-7/8 for fractions)</span></label>
                    <input className="border p-2 rounded w-full"
                      value={el.clearWidthStr}
                      onChange={e => { const copy = [...elevators]; copy[idx].clearWidthStr = e.target.value; setElevators(copy); }} />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Clear Opening Height (inches) <span className="text-xs text-gray-500">(e.g., 84 or 7-3/4)</span></label>
                    <input className="border p-2 rounded w-full"
                      value={el.clearHeightStr}
                      onChange={e => { const copy = [...elevators]; copy[idx].clearHeightStr = e.target.value; setElevators(copy); }} />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Elevator Frame Width (inches) <span className="text-xs text-gray-500">(e.g., 2-7/8)</span></label>
                    <input className="border p-2 rounded w-full"
                      value={el.frameWidthStr}
                      onChange={e => { const copy = [...elevators]; copy[idx].frameWidthStr = e.target.value; setElevators(copy); }} />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Frame Projection from Face of Wall (inches)</label>
                    <input className="border p-2 rounded w-full"
                      value={el.frameProjectionStr}
                      onChange={e => { const copy = [...elevators]; copy[idx].frameProjectionStr = e.target.value; setElevators(copy); }} />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Ceiling/Soffit Height in Front of Elevator (inches)</label>
                    <input className="border p-2 rounded w-full"
                      value={el.soffitHeightStr}
                      onChange={e => { const copy = [...elevators]; copy[idx].soffitHeightStr = e.target.value; setElevators(copy); }} />
                    {over12ft && <p className="text-sm text-red-600 mt-1">Soffit height &gt; 144" — contact factory for guidance.</p>}
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Curtain Type</label>
                    <select className="border p-2 rounded w-full" value={el.curtainType}
                      onChange={e => { const copy = [...elevators]; copy[idx].curtainType = e.target.value as any; setElevators(copy); }}>
                      <option value="stub-rails">Rolls down face of frame with stub rails</option>
                      <option value="aux-rails">Rolls down auxiliary rails beside the frame</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Preferred Rail Width (optional)</label>
                    <select className="border p-2 rounded w-full" value={el.preferredRailWidth || 'auto'}
                      onChange={e => { const copy = [...elevators]; copy[idx].preferredRailWidth = e.target.value as any; setElevators(copy); }}>
                      <option value="auto">Auto (default)</option>
                      <option value="2">2"</option>
                      <option value="3.375">3-3/8"</option>
                      <option value="4">4"</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-sm block mb-1">Notes (optional)</label>
                    <textarea className="border p-2 rounded w-full" rows={2}
                      value={el.notes || ''}
                      onChange={e => { const copy = [...elevators]; copy[idx].notes = e.target.value; setElevators(copy); }} />
                  </div>
                </div>
              </div>
            )})}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="brand-btn">Back</button>
            <button onClick={() => setStep(4)} disabled={!canGoNext()} className="brand-btn">Review</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4">
          <h2 className="brand-h2">Review and Submit</h2>
          <div className="brand-card p-4">
            <h3 className="font-medium mb-2">Project</h3>
            <p><strong>{project.name}</strong>, {project.locationCity}, {project.locationState}</p>
            <p>Shipping ZIP: {project.shippingZip}</p>
            <p>GC: {project.generalContractor}</p>
            <p>Architect: {project.architect}</p>
          </div>
          <div className="brand-card p-4">
            <h3 className="font-medium mb-2">Subcontractor</h3>
            <p><strong>{subcontractor.company}</strong></p>
            <p>{subcontractor.salesperson} — {subcontractor.email} — {subcontractor.phone}</p>
          </div>
          <div className="brand-card p-4">
            <h3 className="font-medium mb-2">Elevators ({elevators.length}) — GX model, curtain height, and rail width are derived on submit</h3>
            <ol className="list-decimal ml-5 space-y-2">
              {elevators.map((el, i) => (
                <li key={i}>
                  Floors total: {el.floorsTotal} | Floors w/ curtain: {el.floorsWithCurtain.join(', ') || '—'} | Opening: {el.clearWidthStr}w x {el.clearHeightStr}h | Frame width: {el.frameWidthStr} | Projection: {el.frameProjectionStr} | Soffit: {el.soffitHeightStr} | Type: {el.curtainType} | Rail pref: {el.preferredRailWidth || 'auto'}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="brand-btn">Back</button>
            <button onClick={handleSubmit} className="brand-btn">Submit</button>
          </div>
        </section>
      )}
    </main>
  );
}
