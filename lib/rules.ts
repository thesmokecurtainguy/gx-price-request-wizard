import type { ElevatorInput, MountType, ElevatorDerived, SizingRow } from './types';

/** Fallback table until a CSV/XLS is provided */
const sizeMap: Array<{ min:number; max:number; mount: MountType; model: string }> = [
  { min: 41, max: 42.0, mount: 'stub-rails', model: 'GX 42-44' },
  { min: 41, max: 42.0, mount: 'aux-rails',  model: 'GX 46-48' },
  { min: 42.01, max: 44.0, mount: 'stub-rails', model: 'GX 44-46' },
  { min: 42.01, max: 44.0, mount: 'aux-rails',  model: 'GX 48-50' },
  { min: 0, max: 60, mount: 'stub-rails', model: 'GX 36-60 (check exact)' },
  { min: 0, max: 60, mount: 'aux-rails',  model: 'GX 40-64 (check exact)' },
  { min: 60.01, max: 96, mount: 'stub-rails', model: 'GX 60-96 (check exact)' },
  { min: 60.01, max: 96, mount: 'aux-rails',  model: 'GX 64-100 (check exact)' },
];

function mapToGxModel(clearWidth: number, mount: MountType): string | null {
  for (const row of sizeMap) {
    if (row.mount === mount && clearWidth >= row.min && clearWidth <= row.max) {
      return row.model;
    }
  }
  return null;
}

// Helpers for table-driven model selection
function inRange(val: number, min?: number, max?: number): boolean {
  if (min != null && val < min) return false;
  if (max != null && val > max) return false;
  return true;
}
function pickModelFromTable(clearWidth: number, frameWidth: number, frameProj: number, mount: MountType, table?: SizingRow[]): string | null {
  if (!table || !table.length) return null;
  for (const row of table) {
    if (row.mount_type !== mount) continue;
    if (!inRange(clearWidth, row.min_clear_width, row.max_clear_width)) continue;
    if (!inRange(frameWidth, row.min_frame_width, row.max_frame_width)) continue;
    if (!inRange(frameProj, row.min_frame_projection, row.max_frame_projection)) continue;
    return row.gx_model;
  }
  return null;
}

/** Rail width: default 3-3/8", >60" suggest 4", allow explicit override */
function deriveRailWidth(clearWidth: number, preferred?: 'auto'|'2'|'3.375'|'4'): number {
  if (preferred && preferred !== 'auto') return Number(preferred);
  if (clearWidth > 60) return 4;
  return 3.375;
}

export function deriveForElevator(e: ElevatorInput, table?: SizingRow[]): ElevatorDerived {
  const warnings: string[] = [];
  const rfis: string[] = [];

  if (e.curtainType === 'stub-rails' && e.frameProjection > 0.75) {
    warnings.push(`Frame projects ${e.frameProjection}\"; auxiliary rails may be required.`);
  }

  const gxModel = pickModelFromTable(e.clearWidth, e.frameWidth, e.frameProjection, e.curtainType, table)
                || mapToGxModel(e.clearWidth, e.curtainType);
  const railWidth = deriveRailWidth(e.clearWidth, e.preferredRailWidth);

  // Curtain height class from soffit height
  let curtainHeightLabel: string | null = null;
  if (e.soffitHeight <= 120) curtainHeightLabel = "10'";
  else if (e.soffitHeight > 120 && e.soffitHeight <= 144) curtainHeightLabel = "12'";
  else rfis.push('Soffit height > 12 ft — contact factory for guidance.');

  if (e.soffitHeight <= 0) rfis.push('Soffit/ceiling height missing or invalid.');
  if (e.floorsWithCurtain.length === 0) rfis.push('No floors selected for curtain deployment.');

  return { gxModel, railWidth, curtainHeightLabel, warnings, rfis };
}
