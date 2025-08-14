import type { Inputs, Derived, SizingRow } from './types';
import { deriveForElevator } from './rules';

function zipToFreightNotes(zip: string): string[] {
  const out: string[] = [];
  const z = (zip || '').trim();
  if (!/^[0-9]{5}$/.test(z)) {
    out.push('Shipping ZIP missing or invalid. RFI required.');
    return out;
  }
  const first3 = Number(z.slice(0,3));
  const starts = (p: string) => z.startsWith(p);
  const isAK = first3 >= 995 && first3 <= 999;
  const isHI = first3 >= 967 && first3 <= 968;
  const isPRorVI = starts('006') || starts('007') || starts('008') || starts('009');
  const isGUorPacific = starts('969');
  if (isAK || isHI || isPRorVI || isGUorPacific) out.push('Special freight likely (non-continental or territory).');
  return out;
}

type MaybeWithTable = Inputs & { sizingTable?: SizingRow[] };

export function deriveAll(inputs: MaybeWithTable): Derived {
  const elevators = inputs.elevators.map(e => deriveForElevator(e, inputs.sizingTable));
  const anyRfi = elevators.some(e => e.rfis.length > 0);
  const freightNotes = zipToFreightNotes(inputs.project.shippingZip);
  return { elevators, anyRfi, freightNotes };
}
