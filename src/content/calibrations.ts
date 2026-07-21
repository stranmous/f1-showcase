import type { CarId, ModelCalibration } from './types'

export const modelCalibrations = {
  mp44: {
    rotation: [0, Math.PI, 0],
    scale: 0.2039452309,
    position: [0.0011216988, 0.0091775354, 0],
    cameraTarget: [0, 0.42, 0],
    heroCamera: {
      position: [-6.1, 3, -7.2],
      fov: 32,
    },
    evidence: {
      rawBounds: {
        dimensions: [10.349, 4.907, 21.545],
        minimumY: -0.045,
      },
      referenceMeasurement: {
        dimension: 'length',
        metres: 4.394,
        rawUnits: 21.545,
      },
      source: {
        label: 'Ultimatecarpage — 1988 McLaren MP4/4 Honda specifications',
        url: 'https://www.ultimatecarpage.com/spec/343/McLaren-MP4-4-Honda.html',
      },
      method: 'Uniform scale = documented length (4.394 m) ÷ audited raw Z length (21.545). Position centres raw bounds and raises the -0.045 minimum Y to the gallery floor.',
    },
  },
  f2002: {
    rotation: [0, Math.PI, 0],
    scale: 1.0412323373,
    position: [0, 0.0041649293, 0.2649936298],
    cameraTarget: [0, 0.43, 0],
    heroCamera: {
      position: [-6.2, 3.1, -7.4],
      fov: 32,
    },
    evidence: {
      rawBounds: {
        dimensions: [1.79, 1.038, 4.317],
        minimumY: -0.004,
      },
      referenceMeasurement: {
        dimension: 'length',
        metres: 4.495,
        rawUnits: 4.317,
      },
      source: {
        label: 'Ultimatecarpage — 2002 Ferrari F2002 specifications',
        url: 'https://www.ultimatecarpage.com/spec/1237/Ferrari-F2002.html',
      },
      method: 'Uniform scale = documented length (4.495 m) ÷ audited raw Z length (4.317). The Y offset raises the raw minimum to the gallery floor; the positive Z offset recentres the raw Z midpoint after the π rotation.',
    },
  },
  w11: {
    rotation: [0, Math.PI, 0],
    scale: 1,
    position: [0, -0.004, 0.0055],
    cameraTarget: [0, 0.45, 0],
    heroCamera: {
      position: [-7.1, 3.4, -8.4],
      fov: 32,
    },
    evidence: {
      rawBounds: {
        dimensions: [2, 1.104, 5.695],
        minimumY: 0.004,
      },
      referenceMeasurement: {
        dimension: 'width',
        metres: 2,
        rawUnits: 2,
      },
      source: {
        label: 'FIA — 2020 Formula One Technical Regulations',
        url: 'https://api.fia.com/sites/default/files/2020_formula_1_technical_regulations_-_iss_3_-_2020-03-06.pdf',
      },
      method: 'Uniform scale = FIA 2.000 m maximum width ÷ audited 2.000 raw-unit width. This is a regulation-envelope calibration because no exact manufacturer overall length is publicly recorded in the project sources. The Y offset lowers the raw minimum to the gallery floor; the positive Z offset recentres the raw Z midpoint after the π rotation.',
    },
  },
  rb19: {
    rotation: [0, Math.PI, 0],
    scale: 1.4419610671,
    position: [0, 0, 0.5443403028],
    cameraTarget: [0, 0.46, 0],
    heroCamera: {
      position: [-7.2, 3.5, -8.5],
      fov: 32,
    },
    evidence: {
      rawBounds: {
        dimensions: [1.387, 0.805, 3.737],
        minimumY: 0,
      },
      referenceMeasurement: {
        dimension: 'width',
        metres: 2,
        rawUnits: 1.387,
      },
      source: {
        label: 'FIA — 2023 Formula 1 Technical Regulations',
        url: 'https://www.fia.com/sites/default/files/fia_2023_formula_1_technical_regulations_-_issue_6_-_2023-04-25.pdf',
      },
      method: 'Uniform scale = FIA 2.000 m width envelope ÷ audited 1.387 raw-unit width. The raw model already meets the floor at Y=0; the positive Z offset recentres the raw Z midpoint after the π rotation.',
    },
  },
} as const satisfies Partial<Record<CarId, ModelCalibration>>
