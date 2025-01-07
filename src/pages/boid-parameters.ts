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
    // default values, orbit
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.0,
  },
  // begin to ease into high cohesion, form closely packed flocks
  features: {
    separationDistance: 10.0,
    alignmentDistance: 25.0,
    cohesionDistance: 40.0,
    centerAttractionStrength: 4.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 8.0,
    cameraZoom: 2.0,
  },
  why: {
    // high cohesion, form closely packed flocks
    separationDistance: 2.0,
    alignmentDistance: 30.0,
    cohesionDistance: 60.0,
    centerAttractionStrength: 5.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 8.0,
    cameraZoom: 2.0,
  },
  pricing: {
    // high separation, avoid each other swim around aimlessly
    separationDistance: 50.0,
    alignmentDistance: 20.0,
    cohesionDistance: 10.0,
    centerAttractionStrength: 2.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 6.0,
    cameraZoom: 2.0,
  },
  cta: {
    // back to default values, orbit, beign speeding up and zooming out
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 3.0,
    predatorRepulsionStrength: 50.0,
    predatorRepulsionRadius: 80.0,
    speedLimit: 8.0,
    cameraZoom: 1.6,
  },
  // back to default values, orbit speed up and zoom out
  playground: {
    separationDistance: 20.0,
    alignmentDistance: 20.0,
    cohesionDistance: 20.0,
    centerAttractionStrength: 4.0,
    predatorRepulsionStrength: 70.0,
    predatorRepulsionRadius: 60.0,
    speedLimit: 10.0,
    cameraZoom: 1.4,
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
