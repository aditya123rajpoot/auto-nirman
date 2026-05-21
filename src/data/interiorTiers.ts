export type InteriorTierId = 'basic' | 'standard' | 'premium' | 'luxury' | 'super_luxury';

export type InteriorTier = {
  id: InteriorTierId;
  name: string;
  description: string;
  costPerSqFt: number;
  materials: {
    flooring: string;
    wallFinish: string;
    ceiling: string;
    lighting: string;
    kitchenFittings: string;
    bathFittings: string;
  };
  furnitureLevel: string;
  lightingLevel: string;
  renderStyle: {
    floorColor: string;
    wallColor: string;
    ceilingColor: string;
    woodColor: string;
    metalColor: string;
    fabricColor: string;
    accentColor: string;
    roughness: number;
    metalness: number;
    lightIntensity: number;
    decorDensity: number;
  };
  sampleItems: string[];
};

export const interiorTiers: Record<InteriorTierId, InteriorTier> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'Durable starter interiors with practical finishes and minimal decor.',
    costPerSqFt: 950,
    materials: {
      flooring: 'Vitrified ceramic tile',
      wallFinish: 'Acrylic emulsion paint',
      ceiling: 'Plain POP border',
      lighting: 'Surface LED panels',
      kitchenFittings: 'Laminate shutters, granite counter, SS sink',
      bathFittings: 'CP fittings with standard sanitaryware',
    },
    furnitureLevel: 'Essential modular',
    lightingLevel: 'Functional ambient',
    renderStyle: {
      floorColor: '#b8b0a4',
      wallColor: '#e8e2d8',
      ceilingColor: '#f4f1ea',
      woodColor: '#8b6b4f',
      metalColor: '#9ca3af',
      fabricColor: '#6b7280',
      accentColor: '#38bdf8',
      roughness: 0.72,
      metalness: 0.04,
      lightIntensity: 1.1,
      decorDensity: 0.35,
    },
    sampleItems: ['Tile flooring', 'Painted walls', 'Basic wardrobe', 'Standard lights'],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced modern interiors with stronger materials and better lighting.',
    costPerSqFt: 1450,
    materials: {
      flooring: 'Large format vitrified tile',
      wallFinish: 'Washable premium paint',
      ceiling: 'POP false ceiling in key areas',
      lighting: 'Warm recessed downlights',
      kitchenFittings: 'HDHMR shutters, quartz counter, branded hardware',
      bathFittings: 'Branded CP fittings and wall-hung vanity',
    },
    furnitureLevel: 'Good modular',
    lightingLevel: 'Layered ambient',
    renderStyle: {
      floorColor: '#c8bda9',
      wallColor: '#ece7df',
      ceilingColor: '#fbfaf6',
      woodColor: '#6f4e37',
      metalColor: '#a8a29e',
      fabricColor: '#4b6475',
      accentColor: '#22d3ee',
      roughness: 0.58,
      metalness: 0.06,
      lightIntensity: 1.35,
      decorDensity: 0.5,
    },
    sampleItems: ['Large tile flooring', 'Quartz kitchen top', 'Modular wardrobe', 'Recessed lighting'],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Warm premium home finish with veneer accents, richer furniture, and mood lighting.',
    costPerSqFt: 2350,
    materials: {
      flooring: 'Engineered wooden / premium tile mix',
      wallFinish: 'Texture paint with veneer feature panels',
      ceiling: 'Designer false ceiling with coves',
      lighting: 'Cove lights, spots, pendants',
      kitchenFittings: 'Acrylic shutters, quartz, soft-close hardware',
      bathFittings: 'Concealed fittings, glass partition, premium vanity',
    },
    furnitureLevel: 'Premium modular and soft furnishings',
    lightingLevel: 'Mood and task lighting',
    renderStyle: {
      floorColor: '#a98262',
      wallColor: '#eee6dc',
      ceilingColor: '#fffaf3',
      woodColor: '#5a3825',
      metalColor: '#c7a15a',
      fabricColor: '#334155',
      accentColor: '#fbbf24',
      roughness: 0.44,
      metalness: 0.1,
      lightIntensity: 1.65,
      decorDensity: 0.68,
    },
    sampleItems: ['Wooden floor zones', 'Veneer feature wall', 'Pendant lights', 'Soft-close kitchen'],
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description: 'High-end designer interiors with stone, brass accents, and curated decor.',
    costPerSqFt: 3800,
    materials: {
      flooring: 'Italian marble / engineered wood',
      wallFinish: 'Stone cladding, veneer, premium wallcovering',
      ceiling: 'Designer layered ceiling',
      lighting: 'Architectural lighting with scene control',
      kitchenFittings: 'PU shutters, stone counter, premium appliances',
      bathFittings: 'Luxury sanitaryware, rain shower, glass enclosure',
    },
    furnitureLevel: 'Designer loose and modular furniture',
    lightingLevel: 'Scene-based luxury lighting',
    renderStyle: {
      floorColor: '#d6c6ad',
      wallColor: '#f3eee6',
      ceilingColor: '#fffdf8',
      woodColor: '#3f2a1d',
      metalColor: '#d6b45f',
      fabricColor: '#1f2937',
      accentColor: '#d6b45f',
      roughness: 0.3,
      metalness: 0.16,
      lightIntensity: 1.95,
      decorDensity: 0.82,
    },
    sampleItems: ['Marble flooring', 'Stone feature wall', 'Designer lights', 'Premium appliances'],
  },
  super_luxury: {
    id: 'super_luxury',
    name: 'Super Luxury',
    description: 'Signature-grade interiors with imported materials, bespoke furniture, and cinematic lighting.',
    costPerSqFt: 6200,
    materials: {
      flooring: 'Imported marble and herringbone wood',
      wallFinish: 'Bespoke wall panels, stone slabs, fabric panels',
      ceiling: 'Architectural ceiling with integrated services',
      lighting: 'Cinematic smart lighting and decorative fixtures',
      kitchenFittings: 'Imported kitchen system with premium appliance suite',
      bathFittings: 'Spa-grade fixtures, wall niches, premium glass',
    },
    furnitureLevel: 'Bespoke designer furniture',
    lightingLevel: 'Smart cinematic lighting',
    renderStyle: {
      floorColor: '#e6d7bd',
      wallColor: '#f8f4ed',
      ceilingColor: '#fffefa',
      woodColor: '#2f1f16',
      metalColor: '#f0c96a',
      fabricColor: '#111827',
      accentColor: '#f0c96a',
      roughness: 0.22,
      metalness: 0.22,
      lightIntensity: 2.25,
      decorDensity: 1,
    },
    sampleItems: ['Imported marble', 'Bespoke furniture', 'Smart scenes', 'Spa bath fixtures'],
  },
};

export const interiorTierList = Object.values(interiorTiers);
