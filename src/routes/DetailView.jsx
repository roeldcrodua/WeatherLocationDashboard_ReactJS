import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Current from '../components/Current';
import Forecast from '../components/Forecast';
import Astronomy from '../components/Astronomy';
import Marine from '../components/Marine';
import SearchHistory from '../components/SearchHistory';
import { 
  mmToInches, 
  formatTemp, 
  formatSpeed, 
  formatDistance, 
  fetchWeatherConditions, 
  getWeatherIcon,
  WEATHER_API_KEY,
  WEATHER_BASE_URL,
  useScreenWidth
} from '../App';

function DetailView() {
  const { name, lat, lon } = useParams();
  const navigate = useNavigate();
  
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [astronomy, setAstronomy] = useState(null);
  const [marine, setMarine] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const units = { temp: 'F', distance: 'mi' };
  const [weatherConditionsMapping, setWeatherConditionsMapping] = useState(null);
  const screenWidth = useScreenWidth();
  const [visible, setVisible] = useState({
    current: true,
    forecast: true,
    astronomy: true,
    marine: true,
  });

  const toggleVisible = useCallback((key) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Fetch weather conditions mapping
  useEffect(() => {
    const loadWeatherConditions = async () => {
      const mapping = await fetchWeatherConditions();
      setWeatherConditionsMapping(mapping);
    };
    loadWeatherConditions();
  }, []);

  const getIconPath = useCallback((conditionCode, isDay) => {
    return getWeatherIcon(conditionCode, isDay, weatherConditionsMapping);
  }, [weatherConditionsMapping]);

  const handleSearch = async (query) => {
    // Navigate to new detail view
    try {
      const response = await fetch(`${WEATHER_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${query}`);
      if (!response.ok) throw new Error('Failed to fetch weather data');
      
      const data = await response.json();
      
      // Add to search history
      const historyItem = {
        id: `${data.location.name}-${data.location.lat}-${data.location.lon}-${Date.now()}`,
        query: data.location.name,
        current: {
          icon: data.current.condition.icon,
          condition: data.current.condition.text,
          temp: units.temp === 'F' ? `${Math.round(data.current.temp_f)}°F` : `${Math.round(data.current.temp_c)}°C`
        },
        timestamp: new Date().toISOString()
      };
      setSearchHistory(prev => [historyItem, ...prev].slice(0, 10));
      
      navigate(`/details/${encodeURIComponent(data.location.name)}/${data.location.lat}/${data.location.lon}`);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  useEffect(() => {
    const fetchWeatherDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const query = `${lat},${lon}`;

        const [currentRes, forecastRes, astronomyRes, marineRes] = await Promise.all([
          fetch(`${WEATHER_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${query}`),
          fetch(`${WEATHER_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${query}&days=1`),
          fetch(`${WEATHER_BASE_URL}/astronomy.json?key=${WEATHER_API_KEY}&q=${query}`),
          fetch(`${WEATHER_BASE_URL}/marine.json?key=${WEATHER_API_KEY}&q=${query}`).catch(() => null)
        ]);

        if (!currentRes.ok || !forecastRes.ok || !astronomyRes.ok) {
          throw new Error('Failed to fetch weather details');
        }

        const [current, forecastData, astronomyData, marineData] = await Promise.all([
          currentRes.json(),
          forecastRes.json(),
          astronomyRes.json(),
          marineRes ? marineRes.json() : null
        ]);

        setCurrentWeather(current);
        setForecast(forecastData);
        setAstronomy(astronomyData);
        setMarine(marineData);
        
        // Add current location to search history
        const historyItem = {
          id: `${current.location.name}-${current.location.lat}-${current.location.lon}-${Date.now()}`,
          query: current.location.name,
          current: {
            icon: current.current.condition.icon,
            condition: current.current.condition.text,
            temp: units.temp === 'F' ? `${Math.round(current.current.temp_f)}°F` : `${Math.round(current.current.temp_c)}°C`
          },
          timestamp: new Date().toISOString()
        };
        setSearchHistory(prev => {
          // Check if already exists
          const exists = prev.find(item => item.query === historyItem.query);
          if (exists) return prev;
          return [historyItem, ...prev].slice(0, 10);
        });

      } catch (err) {
        console.error('Error fetching weather details:', err);
        setError('Failed to load weather details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherDetails();
  }, [name, lat, lon]);

  if (isLoading) {
    return (
      <div className="main-content">
        <div className="loading-message">
          <i className="fas fa-spinner fa-spin"></i> Loading weather details for {decodeURIComponent(name)}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-message">{error}</div>
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="main-content">
        <div className="detail-header">
          <Link to="/" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>
          <h2>Weather Details for {decodeURIComponent(name)}</h2>
          <p className="location-coordinates">
            <i className="fas fa-map-pin"></i> Coordinates: {lat}°, {lon}°
          </p>
        </div>

        <div className="visibility-controls">
          <div className="controls-row">
            <span className="controls-title">Filter Options:</span>
            <label><input type="checkbox" checked={visible.current} onChange={() => toggleVisible('current')} /> Current</label>
            <label><input type="checkbox" checked={visible.forecast} onChange={() => toggleVisible('forecast')} /> Forecast</label>
            <label><input type="checkbox" checked={visible.astronomy} onChange={() => toggleVisible('astronomy')} /> Astronomy</label>
            <label><input type="checkbox" checked={visible.marine} onChange={() => toggleVisible('marine')} /> Marine</label>
          </div>
        </div>

        <div className="weather-info">
          {visible.current && (
            <Current 
              data={currentWeather} 
              units={units} 
              formatTemp={formatTemp} 
              formatSpeed={formatSpeed} 
              formatDistance={formatDistance} 
              getWeatherIcon={getIconPath} 
            />
          )}
          {visible.forecast && (
            <Forecast 
              data={forecast} 
              units={units} 
              formatTemp={formatTemp} 
              formatSpeed={formatSpeed} 
              mmToInches={mmToInches} 
              getWeatherIcon={getIconPath} 
            />
          )}
          {visible.astronomy && (
            <Astronomy data={astronomy} units={units} />
          )}
          {visible.marine && (
            <Marine data={marine} units={units} />
          )}
        </div>
      </div>

      <div className="right-panel">
        <SearchHistory history={searchHistory} onSelect={handleSearch} />
      </div>

      <div className="bottom-panel">
        {screenWidth <= 900 && (
          <div className="bottom-history">
            <SearchHistory history={searchHistory} onSelect={handleSearch} />
          </div>
        )}
      </div>
    </>
  );
}

export default DetailView;
