export type RoadSide = 'north' | 'east' | 'south' | 'west';
export type Map2DHouseType = '2bhk' | '3bhk';
export type Map2DPlotMode = 'rectangle' | 'trace';
export type Map2DPlanStyle = 'compact' | 'family' | 'premium';
export type Map2DAIPlanStrategy = 'open_living' | 'privacy_first' | 'compact_core' | 'premium_family';

export type Map2DAIPlan = {
  conceptTitle: string;
  strategy: Map2DAIPlanStrategy;
  roomEmphasis: 'living' | 'bedrooms' | 'balanced';
  recommendedRooms: string[];
  rooms?: Array<{
    label: string;
    type: Map2DRoom['type'];
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  designNotes: string[];
  scoreAdjustments?: Partial<{
    efficiency: number;
    vastu: number;
    circulation: number;
    daylight: number;
  }>;
};

export type Map2DPoint = {
  x: number;
  y: number;
};

export type Map2DInput = {
  plotMode?: Map2DPlotMode;
  plotLength: number;
  plotWidth: number;
  plotPolygon?: Map2DPoint[];
  roadSide: RoadSide;
  houseType: Map2DHouseType;
  bedrooms?: number;
  bathrooms?: number;
  planStyle?: Map2DPlanStyle;
  aiBrief?: string;
  aiPlan?: Map2DAIPlan;
  vastu: boolean;
  parking: boolean;
  staircase: boolean;
  city: string;
};

export type Map2DRoom = {
  id: string;
  label: string;
  type:
    | 'living'
    | 'kitchen'
    | 'bedroom'
    | 'bath'
    | 'parking'
    | 'stair'
    | 'dining'
    | 'utility'
    | 'circulation'
    | 'court'
    | 'balcony'
    | 'store';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points?: Map2DPoint[];
  areaSqft?: number;
  dimensions?: string;
};

export type Map2DDoor = {
  x: number;
  y: number;
  width: number;
  orientation: 'north' | 'east' | 'south' | 'west';
};

export type Map2DWindow = {
  x: number;
  y: number;
  width: number;
  orientation: 'north' | 'east' | 'south' | 'west';
};

export type Map2DLayout = {
  input: Map2DInput;
  plot: {
    length: number;
    width: number;
    buildableLength: number;
    buildableWidth: number;
    setback: number;
    polygon?: Map2DPoint[];
    areaSqft: number;
    bounds: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    };
  };
  rooms: Map2DRoom[];
  doors: Map2DDoor[];
  windows: Map2DWindow[];
  aiNotes: string[];
  aiPlan?: Map2DAIPlan;
  score: {
    efficiency: number;
    vastu: number;
    circulation: number;
    daylight: number;
  };
};
