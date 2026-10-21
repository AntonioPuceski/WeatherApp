export type Unit = 'metric' | 'imperial';
// All stored measurements are metric, including forecast values.
export const temperature = (celsius: number, unit: Unit) =>
  Math.round(unit === 'metric' ? celsius : celsius * 9 / 5 + 32);
export const windSpeed = (metersPerSecond: number, unit: Unit) =>
  Math.round((unit === 'metric' ? metersPerSecond : metersPerSecond * 2.2369362921) * 10) / 10;
