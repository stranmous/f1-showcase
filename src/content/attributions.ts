import type { CarId } from './types'

export type AssetAttribution = {
  id: CarId
  carName: string
  modelName: string
  creator: string
  sourceUrl: string
  licenseName: string
  licenseUrl: string
  handling: string
}

export const assetAttributions: readonly AssetAttribution[] = [
  {
    id: 'mp44',
    carName: '1988 McLaren MP4/4',
    modelName: 'McLaren MP4/4 (for Dallin_L)',
    creator: 'Dave Love SketchFab',
    sourceUrl: 'https://skfb.ly/pDowy',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    handling: 'Adapted as a source-preserving runtime serialization; original geometry and textures are retained. Credit the creator and link the licence.',
  },
  {
    id: 'f2002',
    carName: '2002 Ferrari F2002',
    modelName: '2002 Ferrari F2002',
    creator: 'Dave Love SketchFab',
    sourceUrl: 'https://skfb.ly/pLMSx',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    handling: 'Adapted as a source-preserving runtime serialization; original geometry and textures are retained. Credit the creator and link the licence.',
  },
  {
    id: 'w11',
    carName: '2020 Mercedes-AMG F1 W11 EQ Performance',
    modelName: '2020 F1 Mercedes-Benz W11',
    creator: 'OUTPISTON',
    sourceUrl: 'https://skfb.ly/pEXRq',
    licenseName: 'CC BY-NC-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    handling: 'Adapted as a source-preserving runtime serialization; original geometry and textures are retained. Non-commercial use only; credit the creator and share adaptations under the same licence.',
  },
  {
    id: 'rb19',
    carName: '2023 Red Bull Racing RB19',
    modelName: 'Oracle Red Bull F1 Car RB19 2023',
    creator: 'Redgrund',
    sourceUrl: 'https://skfb.ly/oR7sq',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    handling: 'Adapted as a source-preserving runtime serialization; original geometry and textures are retained. Credit the creator and link the licence.',
  },
]
