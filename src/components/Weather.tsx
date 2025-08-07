import React, { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  feelsLike: number;
  pressure: number;
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');

      // First try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await getWeatherByCoords(latitude, longitude);
          },
          async () => {
            // If geolocation fails, try to get weather by IP
            await getWeatherByIP();
          },
          { timeout: 10000, enableHighAccuracy: false }
        );
      } else {
        // Fallback to IP-based location
        await getWeatherByIP();
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Unable to fetch weather');
      setMockWeather();
    }
  };

  const getWeatherByCoords = async (lat: number, lon: number) => {
    try {
      // Using a free weather API that doesn't require API key
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Weather API error');
      }

      const data = await response.json();
      
      // Get city name from coordinates using reverse geocoding
      const cityResponse = await fetch(
        `https://api.open-meteo.com/v1/geocoding?latitude=${lat}&longitude=${lon}`
      );
      
      let cityName = 'Your Location';
      if (cityResponse.ok) {
        const cityData = await cityResponse.json();
        if (cityData.results && cityData.results[0]) {
          cityName = cityData.results[0].name;
        }
      }

      const weatherCode = data.current.weather_code;
      const condition = getWeatherCondition(weatherCode);

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        condition: condition,
        location: cityName,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m * 3.6), // Convert m/s to km/h
        icon: getWeatherIcon(condition),
        feelsLike: Math.round(data.current.apparent_temperature),
        pressure: Math.round(data.current.pressure_msl)
      });
      setLoading(false);
    } catch (err) {
      console.error('Weather by coords error:', err);
      await getWeatherByIP();
    }
  };

  const getWeatherByIP = async () => {
    try {
      // Get location by IP using a free service
      const ipResponse = await fetch('https://ipapi.co/json/');
      if (!ipResponse.ok) {
        throw new Error('IP location service error');
      }

      const ipData = await ipResponse.json();
      const { latitude, longitude, city: ipCity } = ipData;

      if (latitude && longitude) {
        await getWeatherByCoords(latitude, longitude);
      } else {
        throw new Error('Location not available');
      }
    } catch (err) {
      console.error('IP-based weather error:', err);
      setMockWeather();
    }
  };

  const getWeatherCondition = (code: number): string => {
    const conditions: { [key: number]: string } = {
      0: 'clear sky',
      1: 'mainly clear',
      2: 'partly cloudy',
      3: 'overcast',
      45: 'foggy',
      48: 'depositing rime fog',
      51: 'light drizzle',
      53: 'moderate drizzle',
      55: 'dense drizzle',
      61: 'slight rain',
      63: 'moderate rain',
      65: 'heavy rain',
      71: 'slight snow',
      73: 'moderate snow',
      75: 'heavy snow',
      77: 'snow grains',
      80: 'slight rain showers',
      81: 'moderate rain showers',
      82: 'violent rain showers',
      85: 'slight snow showers',
      86: 'heavy snow showers',
      95: 'thunderstorm',
      96: 'thunderstorm with slight hail',
      99: 'thunderstorm with heavy hail'
    };
    return conditions[code] || 'unknown';
  };

  const getWeatherIcon = (condition: string): string => {
    const icons: { [key: string]: string } = {
      'clear sky': 'fa-sun',
      'mainly clear': 'fa-sun',
      'partly cloudy': 'fa-cloud-sun',
      'overcast': 'fa-cloud',
      'foggy': 'fa-smog',
      'depositing rime fog': 'fa-smog',
      'light drizzle': 'fa-cloud-rain',
      'moderate drizzle': 'fa-cloud-rain',
      'dense drizzle': 'fa-cloud-rain',
      'slight rain': 'fa-cloud-rain',
      'moderate rain': 'fa-cloud-showers-heavy',
      'heavy rain': 'fa-cloud-showers-heavy',
      'slight snow': 'fa-snowflake',
      'moderate snow': 'fa-snowflake',
      'heavy snow': 'fa-snowflake',
      'snow grains': 'fa-snowflake',
      'slight rain showers': 'fa-cloud-rain',
      'moderate rain showers': 'fa-cloud-showers-heavy',
      'violent rain showers': 'fa-cloud-showers-heavy',
      'slight snow showers': 'fa-snowflake',
      'heavy snow showers': 'fa-snowflake',
      'thunderstorm': 'fa-bolt',
      'thunderstorm with slight hail': 'fa-bolt',
      'thunderstorm with heavy hail': 'fa-bolt'
    };
    return icons[condition.toLowerCase()] || 'fa-cloud-sun';
  };

  const setMockWeather = () => {
    setWeather({
      temperature: 22,
      condition: 'partly cloudy',
      location: 'Your City',
      humidity: 65,
      windSpeed: 12,
      icon: 'fa-cloud-sun',
      feelsLike: 24,
      pressure: 1013
    });
    setLoading(false);
  };

  const refreshWeather = () => {
    fetchWeather();
  };

  if (loading) {
    return (
      <div className="glass-card p-6 max-w-xs">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-2xl opacity-60"></i>
          <div className="mt-2 text-sm opacity-80">Loading weather...</div>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="glass-card p-6 max-w-xs">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-2xl opacity-60 mb-2"></i>
          <div className="text-sm opacity-80 mb-3">{error}</div>
          <button 
            onClick={refreshWeather}
            className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full text-sm hover:from-blue-500 hover:to-blue-700 transition-all duration-300"
          >
            <i className="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="glass-card p-6 max-w-xs">
        <div className="text-center text-sm opacity-60">
          Weather unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 max-w-xs">
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <i className={`fas ${weather.icon} text-3xl text-yellow-400 mr-3`}></i>
          <div className="text-3xl font-bold gradient-text">
            {weather.temperature}°C
          </div>
        </div>
        
        <div className="text-sm font-medium mb-2 capitalize">
          {weather.condition}
        </div>
        
        <div className="text-xs opacity-70 mb-3">
          <i className="fas fa-map-marker-alt mr-1"></i>
          {weather.location}
        </div>
        
        <div className="flex justify-between text-xs opacity-80 mb-2">
          <div>
            <i className="fas fa-tint mr-1"></i>
            {weather.humidity}%
          </div>
          <div>
            <i className="fas fa-wind mr-1"></i>
            {weather.windSpeed} km/h
          </div>
        </div>
        
        <div className="flex justify-between text-xs opacity-80">
          <div>
            <i className="fas fa-thermometer-half mr-1"></i>
            Feels {weather.feelsLike}°C
          </div>
          <div>
            <i className="fas fa-compress-alt mr-1"></i>
            {weather.pressure} hPa
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <button 
          onClick={refreshWeather}
          className="text-xs opacity-60 hover:opacity-80 transition-opacity"
        >
          <i className="fas fa-sync-alt mr-1"></i>
          Refresh
        </button>
      </div>
    </div>
  );
};

export default Weather;