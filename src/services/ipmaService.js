export async function getPortugalWeather() {
  try {
    const res = await fetch(
      "https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/1110600.json"
    );
    const data = await res.json();
    const id = data.data[0].idWeatherType;

    if (id <= 3) return "sun";
    if (id <= 7) return "clouds";
    return "rain";
  } catch {
    return "sun";
  }
}
