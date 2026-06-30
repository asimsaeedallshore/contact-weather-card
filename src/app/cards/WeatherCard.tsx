import { hubspot, Heading, Text, Box, Button, LoadingSpinner } from '@hubspot/ui-extensions';
import { useState, useEffect } from 'react';

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

const defaultWeather: WeatherData = {
  city: 'New York',
  temperature: 22,     // Celsius
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 5,
  feelsLike: 21,
  icon: '⛅',
};

const getWeatherIcon = (condition: string) => {
  const iconMap: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Smoke: '💨',
    Haze: '🌫️',
    Dust: '🌪️',
    Fog: '🌫️',
    Sand: '🌪️',
    Ash: '💨',
    Squall: '🌪️',
    Tornado: '🌪️',
  };
  return iconMap[condition] || '🌤️';
};

const WeatherCard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('New York');

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = '0c2e1806cd1d743aa808cf3291f33ce2'; // If you keep OpenWeather, key goes here (not recommended in UI)
      if (!apiKey) {
        throw new Error('Missing API key (use Open-Meteo to avoid keys).');
      }

      const response = await hubspot.fetch({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`,
        method: 'GET'
      });

    

      if (!response.ok) throw new Error('Failed to fetch weather data');

      const data = await response.json();

      setWeather({
        city: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather?.[0]?.main ?? 'Unknown',
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        feelsLike: Math.round(data.main.feels_like),
        icon: getWeatherIcon(data.weather?.[0]?.main ?? 'Unknown'),
      });
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setWeather(defaultWeather);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setWeather(defaultWeather);
  }, []);

  const handleRefresh = () => fetchWeather(city);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    fetchWeather(newCity);
  };

  return (
    <Box padding="medium" direction="column" gap="medium">
      <Heading>Weather Information</Heading>

      {weather && (
        <Box direction="column" gap="small">
          <Box direction="row" gap="medium" alignItems="center">
            <Text>{weather.icon}</Text>
            <Box direction="column" gap="small">
              <Heading level="2">{weather.city}</Heading>
              <Text weight="bold">{weather.temperature}°C</Text>
              <Text>{weather.condition}</Text>
              <Text fontSize="small">Feels like {weather.feelsLike}°C</Text>
            </Box>
          </Box>

          <Box direction="row" gap="large">
            <Box direction="column" gap="small">
              <Text weight="bold" fontSize="small">Humidity</Text>
              <Text>{weather.humidity}%</Text>
            </Box>

            <Box direction="column" gap="small">
              <Text weight="bold" fontSize="small">Wind Speed</Text>
              <Text>{weather.windSpeed} m/s</Text>
            </Box>
          </Box>
        </Box>
      )}

      {loading && (
        <Box gap="small" alignItems="center">
          <LoadingSpinner />
          <Text>Fetching weather data...</Text>
        </Box>
      )}

      {error && (
        <Box direction="column" gap="small">
          <Text>Error: {error}</Text>
          <Text fontSize="small">Showing default weather data</Text>
        </Box>
      )}

      <Box direction="column" gap="small">
        <Text weight="bold" fontSize="small">Quick Select Cities:</Text>
        <Box direction="row" gap="small">
          {['New York', 'London', 'Tokyo', 'Dubai', 'Sydney'].map((cityName) => (
            <Button
              key={cityName}
              onClick={() => handleCityChange(cityName)}
              appearance={city === cityName ? 'primary' : 'secondary'}
            >
              {cityName}
            </Button>
          ))}
        </Box>
      </Box>

      <Button onClick={handleRefresh} appearance="primary">
        Refresh Weather
      </Button>

      <Box direction="column" gap="small">
        <Text fontSize="small" weight="bold">📍 Weather Provider</Text>
        <Text fontSize="small">Currently selected city:</Text>
        <Text fontSize="small" weight="bold">{weather?.city}</Text>
      </Box>
    </Box>
  );
};

export default WeatherCard;
