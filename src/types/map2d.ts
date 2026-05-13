export type RoadSide = 'north' | 'east' | 'south' | 'west';
export type Map2DHouseType = '2bhk' | '3bhk';

export type Map2DInput = {
  plotLength: number;
  plotWidth: number;
  roadSide: RoadSide;
  houseType: Map2DHouseType;
  vastu: boolean;
  parking: boolean;
  staircase: boolean;
  city: string;
};

export type Map2DRoom = {
  id: string;
  label: string;
  type: 'living' | 'kitchen' | 'bedroom' | 'bath' | 'parking' | 'stair' | 'dining' | 'utility';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
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
  };
  rooms: Map2DRoom[];
  doors: Map2DDoor[];
  windows: Map2DWindow[];
  aiNotes: string[];
  score: {
    efficiency: number;
    vastu: number;
    circulation: number;
    daylight: number;
  };
};
