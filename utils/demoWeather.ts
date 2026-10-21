// Deliberately fictional fixtures. Used only with EXPO_PUBLIC_DEMO_MODE=true.
export function demoWeather(city: string) {
  const name = city.trim();
  const snowy = /oslo/i.test(name);
  const rainy = /london/i.test(name);
  const temp = snowy ? -2 : rainy ? 12 : 24;
  const condition = snowy ? 'Snow' : rainy ? 'Rain' : 'Clear';
  const icon = snowy ? '13d' : rainy ? '10d' : '01d';
  const item = (offset: number) => ({
    main: { temp: temp + offset, feels_like: temp + offset - 2, humidity: rainy ? 82 : 55 },
    wind: { speed: 3.5 }, weather: [{ main: condition, icon }],
  });
  return {
    current: { name, ...item(0) },
    forecast: { list: Array.from({ length: 5 }, (_, i) => ({
      ...item(i % 3), dt_txt: `2026-10-${22 + i} 12:00:00`,
    })) },
  };
}
