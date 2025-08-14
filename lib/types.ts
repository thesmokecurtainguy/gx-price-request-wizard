export type MountType = 'stub-rails' | 'aux-rails';

export type ProjectInfo = {
  name: string;
  locationCity: string;
  locationState: string;
  generalContractor: string;
  architect: string;
  shippingZip: string;
};

export type SubcontractorInfo = {
  company: string;
  salesperson: string;
  email: string;
  phone: string;
};

export type ElevatorInput = {
  floorsTotal: number;
  floorsWithCurtain: number[];
  clearWidth: number;
  clearHeight: number;
  frameWidth: number;
  frameProjection: number;
  soffitHeight: number;
  curtainType: MountType;
  preferredRailWidth?: 'auto' | '2' | '3.375' | '4';
  notes?: string;
};

export type Inputs = {
  project: ProjectInfo;
  subcontractor: SubcontractorInfo;
  elevators: ElevatorInput[];
  sizingTable?: SizingRow[];
};

export type ElevatorDerived = {
  gxModel: string | null;
  railWidth: number;
  curtainHeightLabel: string | null;
  warnings: string[];
  rfis: string[];
};

export type Derived = {
  elevators: ElevatorDerived[];
  anyRfi: boolean;
  freightNotes: string[];
};

export type SizingRow = {
  min_clear_width?: number;
  max_clear_width?: number;
  min_frame_width?: number;
  max_frame_width?: number;
  min_frame_projection?: number;
  max_frame_projection?: number;
  mount_type: 'stub-rails' | 'aux-rails';
  gx_model: string;
  notes?: string;
};
