import type { CarFacts, CarId } from './types'

/**
 * Static exhibit content. The future facts UI consumes display values only;
 * research links remain local to the repository by design.
 */
export const carFacts = [
  {
    id: 'mp44',
    year: 1988,
    name: 'McLaren MP4/4',
    constructor: 'McLaren Honda',
    powerUnit: 'Honda RA168-E · 1.5L turbo V6',
    drivers: ['Ayrton Senna', 'Alain Prost'],
    raceWins: { wins: 15, races: 16 },
    poles: 15,
    podiums: 25,
    fastestLaps: 10,
    worldDriversChampionship: { winner: 'Ayrton Senna', year: 1988 },
    worldConstructorsChampionship: { winner: 'McLaren Honda', year: 1988 },
    speed: {
      label: 'Fastest season speed trap',
      valueKph: 333,
      context: 'Senna & Prost · German GP qualifying · Hockenheim',
      confidence: 'recorded',
    },
    research: [
      {
        label: 'Formula 1 — 1988 McLaren team season',
        url: 'https://www.formula1.com/en/latest/article/from-all-out-dominance-to-against-the-odds-comebacks-ranking-mclarens-10.13fHbOZ9XCmNrIWDKaf56m',
      },
      {
        label: 'Formula 1 — McLaren at 50',
        url: 'https://www.formula1.com/en/latest/article/mclaren-50-facts-stats-stand-out-moments.3DAHLmd7S6qfh3AxuDupc6',
      },
      {
        label: 'MP4/4 333 km/h archival claim',
        url: 'https://en.wikipedia.org/wiki/McLaren_MP4/4',
      },
    ],
  },
  {
    id: 'f2002',
    year: 2002,
    name: 'Ferrari F2002',
    constructor: 'Scuderia Ferrari',
    powerUnit: 'Ferrari Tipo 051 · 3.0L naturally aspirated V10',
    drivers: ['Michael Schumacher', 'Rubens Barrichello'],
    raceWins: { wins: 15, races: 19 },
    poles: 11,
    podiums: 28,
    fastestLaps: 15,
    worldDriversChampionship: { winner: 'Michael Schumacher', year: 2002 },
    worldConstructorsChampionship: { winner: 'Scuderia Ferrari', year: 2002 },
    speed: {
      label: 'Estimated peak speed',
      valueKph: 360,
      qualifier: 'setup dependent',
      context: 'Editorial estimate · not an official season speed-trap result',
      confidence: 'estimated',
    },
    research: [
      {
        label: 'Ferrari — 2002 season',
        url: 'https://www.ferrari.com/en-EN/formula1/year-2002',
      },
      {
        label: 'Formula 1 — 2002 team standings',
        url: 'https://www.formula1.com/en/results/2002/team',
      },
      {
        label: 'F2002 career-result breakdown',
        url: 'https://www.gazzetta.it/Formula-1/storie/03-01-2024/michael-schumacher-le-cinque-ferrari-con-cui-vinse-il-mondiale/ferrari-f2002.shtml',
      },
      {
        label: 'F2002 complete Formula 1 career record',
        url: 'https://atlasf1.autosport.com/2003/san/ludvigsen.html',
      },
    ],
  },
  {
    id: 'w11',
    year: 2020,
    name: 'Mercedes-AMG F1 W11 EQ Performance',
    constructor: 'Mercedes-AMG Petronas F1 Team',
    powerUnit: 'Mercedes-AMG F1 M11 EQ Performance · 1.6L turbo hybrid V6',
    drivers: ['Lewis Hamilton', 'Valtteri Bottas', 'George Russell (Sakhir GP)'],
    raceWins: { wins: 13, races: 17 },
    poles: 15,
    podiums: 25,
    fastestLaps: 9,
    worldDriversChampionship: { winner: 'Lewis Hamilton', year: 2020 },
    worldConstructorsChampionship: { winner: 'Mercedes-AMG Petronas F1 Team', year: 2020 },
    speed: {
      label: 'Recorded speed trap',
      valueKph: 360.8,
      context: 'Bottas · Italian GP race · Monza',
      confidence: 'recorded',
    },
    research: [
      {
        label: 'Mercedes-AMG PETRONAS — 2020 season',
        url: 'https://www.mercedesamgf1.com/news/petronas-reflects-on-2020-season-and-historic-seventh-title-double',
      },
      {
        label: 'FIA — 2020 Italian GP race maximum speeds',
        url: 'https://www.fia.com/sites/default/files/2020_08_ita_f1_r0_timing_racemaximumspeeds_v01.pdf',
      },
      {
        label: 'W11 2020 championship record',
        url: 'https://en.wikipedia.org/wiki/Mercedes-AMG_F1_W11_EQ_Performance',
      },
    ],
  },
  {
    id: 'rb19',
    year: 2023,
    name: 'Red Bull Racing RB19',
    constructor: 'Oracle Red Bull Racing',
    powerUnit: 'Honda RBPTH001 · 1.6L turbo hybrid V6',
    drivers: ['Max Verstappen', 'Sergio Pérez'],
    raceWins: { wins: 21, races: 22 },
    poles: 14,
    podiums: 30,
    fastestLaps: 11,
    worldDriversChampionship: { winner: 'Max Verstappen', year: 2023 },
    worldConstructorsChampionship: { winner: 'Oracle Red Bull Racing', year: 2023 },
    speed: {
      label: 'Recorded speed trap',
      valueKph: 354.3,
      context: 'Pérez · Italian GP race · Monza',
      confidence: 'recorded',
    },
    research: [
      {
        label: 'Oracle Red Bull Racing — RB19',
        url: 'https://www.redbullracing.com/int-en/cars/rb19',
      },
      {
        label: 'Formula 1 — 2023 race results',
        url: 'https://www.formula1.com/en/results/2023/races',
      },
      {
        label: 'Formula 1 — 2023 fastest-lap results',
        url: 'https://www.formula1.com/en/results/2023/awards/fastest-laps',
      },
      {
        label: 'FIA — 2023 Italian GP race maximum speeds',
        url: 'https://www.fia.com/sites/default/files/2023_15_ita_f1_r0_timing_racemaximumspeeds_v01.pdf',
      },
    ],
  },
] as const satisfies readonly CarFacts[]

export const carFactsById = {
  mp44: carFacts[0],
  f2002: carFacts[1],
  w11: carFacts[2],
  rb19: carFacts[3],
} as const satisfies Readonly<Record<CarId, CarFacts>>
