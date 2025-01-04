export interface BoidParams {
  separationDistance: number;
  alignmentDistance: number;
  cohesionDistance: number;
  centerAttractionStrength: number;
  predatorRepulsionStrength: number;
  predatorRepulsionRadius: number;
  speedLimit: number;
  cameraZoom: number;
}

export const SECTION_PARAMS: Record<string, BoidParams> = {
  hero: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.0,
  },
  features: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.0,
  },
  why: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.0,
  },
  pricing: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.0,
  },
  cta: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 1.6,
  },
  playground: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 4.0,
    predatorRepulsionStrength: 70.0,
    predatorRepulsionRadius: 50.0,
    speedLimit: 10.0,
    cameraZoom: 1.2,
  },
};

export const SECTION_PARAMS_MOBILE: Record<string, BoidParams> = {
  hero: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.4,
  },
  features: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.4,
  },
  why: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.4,
  },
  pricing: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.4,
  },
  cta: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.2,
  },
  playground: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.0,
  },
};
