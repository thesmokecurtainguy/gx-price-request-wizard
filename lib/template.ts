import { z } from 'zod';
import { deriveAll } from './derive';
import type { Inputs } from './types';

const SizingRow = z.object({
  min_clear_width: z.number().optional(),
  max_clear_width: z.number().optional(),
  min_frame_width: z.number().optional(),
  max_frame_width: z.number().optional(),
  min_frame_projection: z.number().optional(),
  max_frame_projection: z.number().optional(),
  mount_type: z.enum(['stub-rails','aux-rails']),
  gx_model: z.string(),
  notes: z.string().optional(),
});

export const ElevatorSchema = z.object({
  floorsTotal: z.number().int().min(1),
  floorsWithCurtain: z.array(z.number().int().min(1)),
  clearWidth: z.number().positive(),
  clearHeight: z.number().positive(),
  frameWidth: z.number().positive(),
  frameProjection: z.number().nonnegative(),
  soffitHeight: z.number().positive(),
  curtainType: z.enum(['stub-rails', 'aux-rails']),
  preferredRailWidth: z.enum(['auto','2','3.375','4']).optional(),
  notes: z.string().optional().nullable()
});

export const PayloadSchema = z.object({
  project: z.object({
    name: z.string().min(2),
    locationCity: z.string().min(1),
    locationState: z.string().min(1),
    generalContractor: z.string().min(2),
    architect: z.string().min(2),
    shippingZip: z.string().regex(/^[0-9]{5}$/,'5-digit ZIP required')
  }),
  subcontractor: z.object({
    company: z.string().min(2),
    salesperson: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7)
  }),
  elevators: z.array(ElevatorSchema).min(1),
  sizingTable: z.array(SizingRow).optional(),
  attachments: z.array(z.string()).optional()
});

export type Payload = z.infer<typeof PayloadSchema>;

export function renderHtmlEmail(data: Payload) {
  const derived = deriveAll(data as Inputs);

  const elevatorRows = data.elevators.map((el, idx) => {
    const d = derived.elevators[idx];
    return `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;">${idx + 1}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${el.floorsTotal}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${el.floorsWithCurtain.join(', ')}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${el.clearWidth}w × ${el.clearHeight}h</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${el.frameWidth}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${el.frameProjection}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${el.soffitHeight}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${el.curtainType === 'stub-rails' ? 'Face of frame (stub rails)' : 'Auxiliary rails beside frame'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${d.gxModel ?? '<em>RFI needed</em>'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${d.curtainHeightLabel ?? '<em>—</em>'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${d.railWidth}"</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${el.notes ?? ''}</td>
      </tr>
    `;
  }).join('');

  const warningsList = derived.elevators.flatMap((d, i) => d.warnings.map(w => `Elevator ${i+1}: ${w}`));
  const rfisList = derived.elevators.flatMap((d, i) => d.rfis.map(r => `Elevator ${i+1}: ${r}`));

  return `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <h2 style="margin:0 0 8px 0;color:#E30613;">GX Price Request — ${data.project.name}</h2>
      <p style="margin:0 0 16px 0; color:#4b5563;">Location: ${data.project.locationCity}, ${data.project.locationState}</p>
      <p style="margin:0 0 8px 0; color:#4b5563;">Shipping ZIP: ${data.project.shippingZip}</p>

      <table style="border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="padding:6px 8px;color:#6b7280;">General Contractor</td>
          <td style="padding:6px 8px;"><strong>${data.project.generalContractor}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 8px;color:#6b7280;">Architect</td>
          <td style="padding:6px 8px;"><strong>${data.project.architect}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 8px;color:#6b7280;">Subcontractor</td>
          <td style="padding:6px 8px;"><strong>${data.subcontractor.company}</strong> — ${data.subcontractor.salesperson} · ${data.subcontractor.email} · ${data.subcontractor.phone}</td>
        </tr>
      </table>

      <h3 style="margin:16px 0 8px;">Elevator Details and Derived Config</h3>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr style="background:#E3061320;">
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">#</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Floors (total)</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Floors w/ Curtain</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Clear Opening</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Frame Width</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Frame Projection</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Soffit Height</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Mount Type</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">GX Model</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Curtain Height</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Rail Width</th>
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Notes</th>
          </tr>
        </thead>
        <tbody>${elevatorRows}</tbody>
      </table>

      ${warningsList.length ? `<h3 style="margin:16px 0 8px;">Warnings</h3><ul>${warningsList.map(w=>`<li>${w}</li>`).join('')}</ul>` : ''}
      ${derived.freightNotes.length ? `<h3 style="margin:16px 0 8px;">Freight Notes</h3><ul>${derived.freightNotes.map(f=>`<li>${f}</li>`).join('')}</ul>` : ''}
      ${rfisList.length ? `<h3 style="margin:16px 0 8px;">RFIs / Clarifications Needed</h3><ul>${rfisList.map(r=>`<li>${r}</li>`).join('')}</ul>` : ''}

      <p style="margin-top:16px;color:#6b7280;">This request was generated by the GX Price Request Wizard.</p>
    </div>
  `;
}
