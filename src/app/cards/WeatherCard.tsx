import {
  hubspot,
  Heading,
  Text,
  Box,
  Button,
  LoadingSpinner,
} from '@hubspot/ui-extensions';
import { useEffect, useState } from 'react';

hubspot.extend(() => <WeatherCard />);

type WeatherData = {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  icon: string;
};

const DEFAULT_CITY = 'New York';
const CITIES = ['New York', 'London', 'Tokyo', 'Dubai'];

const getWeatherIcon = (condition: string): string => {
  const icons: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Smoke: '💨',
    Haze: '🌫️',
    Fog: '🌫️',
    Tornado: '🌪️',
  };

  return icons[condition] ?? '🌤️';
};

const WeatherCard = () => {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = 'REPLACE_WITH_NEW_API_KEY';

      const response = await hubspot.fetch({
        url:
          `https://api.openweathermap.org/data/2.5/weather` +
          `?q=${encodeURIComponent(cityName)}` +
          `&appid=${apiKey}` +
          `&units=metric`,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Unable to load weather data.');
      }

      const data = await response.json();
      const condition = data.weather?.[0]?.main ?? 'Unknown';

      setWeather({
        city: data.name,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        icon: getWeatherIcon(condition),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load weather data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(DEFAULT_CITY);
  }, []);

  const selectCity = (cityName: string) => {
    setCity(cityName);
    fetchWeather(cityName);
  };

  return (
    <Box padding="medium" direction="column" gap="medium">
      <Heading>Weather</Heading>

      {loading && !weather && (
        <Box direction="row" gap="small" alignItems="center">
          <LoadingSpinner />
          <Text>Loading weather...</Text>
        </Box>
      )}

      {weather && (
        <Box direction="column" gap="small">
          <Box direction="row" gap="medium" alignItems="center">
            <Text>{weather.icon}</Text>

            <Box direction="column" gap="small">
              <Heading level="2">{weather.city}</Heading>
              <Text weight="bold">
                {weather.temperature}°C · {weather.condition}
              </Text>
              <Text fontSize="small">
                Feels like {weather.feelsLike}°C
              </Text>
            </Box>
          </Box>

          <Text>
            Humidity: {weather.humidity}% · Wind: {weather.windSpeed} m/s
          </Text>
        </Box>
      )}

      {error && <Text>{error}</Text>}

      <Box direction="row" gap="small">
        {CITIES.map((cityName) => (
          <Button
            key={cityName}
            appearance={city === cityName ? 'primary' : 'secondary'}
            onClick={() => selectCity(cityName)}
          >
            {cityName}
          </Button>
        ))}
      </Box>

      <Button
        appearance="secondary"
        onClick={() => fetchWeather(city)}
      >
        {loading ? 'Refreshing...' : 'Refresh'}
      </Button>
    </Box>
  );
};

export default WeatherCard;