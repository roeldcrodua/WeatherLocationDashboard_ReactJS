import React, { useEffect, useState, useCallback } from 'react';
import './App.css'
import IPLookup from './components/IPLookup';
import Current from './components/Current';
import Forecast from './components/Forecast';
import Astronomy from './components/Astronomy';
import Marine from './components/Marine';
import Nearby from './components/Nearby';
import Summary from './components/Summary';
import SearchHistory from "./components/Searchhistory";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHERAPI_KEY;
const ZIPCODE_API_KEY = import.meta.env.VITE_ZIPCODESTACK_KEY;
const WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';
const ZIPCODE_BASE_URL = 'https://app.zipcodebase.com/api/v1';
const IPAPI_BASE_URL = 'https://ipapi.co';

// Unit conversion helpers (copied from src/utils/units.js)
const cToF = (c) => (c * 9) / 5 + 32;
const fToC = (f) => ((f - 32) * 5) / 9;

const kmToMi = (km) => km / 1.60934;
const miToKm = (mi) => mi * 1.60934;

const kphToMph = (kph) => kph / 1.60934;
const mphToKph = (mph) => mph * 1.60934;

const mmToInches = (mm) => mm / 25.4;
const inchesToMm = (inches) => inches * 25.4;

const formatTemp = (valueC, unit = 'C') => {
  const v = Number(valueC) || 0;
  if (unit === 'F') return `${Math.round(cToF(v))}°F`;
  return `${Math.round(v)}°C`;
};

const formatSpeed = (kph, units) => {
  const v = Number(kph) || 0;
  if (units?.distance === 'mi') return `${kphToMph(v).toFixed(1)} mph`;
  return `${v.toFixed(1)} km/h`;
};

const formatDistance = (value, units) => {
  const v = Number(value) || 0;
  if (units?.distance === 'km') return `${(Number(v)).toFixed(1)} km`;
  return `${(Number(v)).toFixed(1)} mi`;
};

// Cache for weather conditions to avoid repeated API calls
let weatherConditionsCache = null;

/**
 * Fetch weather condition codes to icon mapping from WeatherAPI
 * @returns {Promise<Object>} Mapping of condition codes to icon numbers
 */
const fetchWeatherConditions = async () => {
  // Return cached data if available
  if (weatherConditionsCache) {
    return weatherConditionsCache;
  }

  try {
    const response = await fetch('https://www.weatherapi.com/docs/weather_conditions.json');
    if (!response.ok) throw new Error('Failed to fetch weather conditions');
    
    const conditions = await response.json();
    
    // Build mapping object from the fetched data
    const mapping = {};
    conditions.forEach(condition => {
      mapping[condition.code] = condition.icon;
    });
    
    // Cache the result
    weatherConditionsCache = mapping;
    return mapping;
  } catch (error) {
    console.error('Error fetching weather conditions:', error);
    // Return default fallback mapping if fetch fails
    return {
      1000: 113, 1003: 116, 1006: 119, 1009: 122, 1030: 143,
      1063: 176, 1066: 179, 1069: 182, 1072: 185, 1087: 200,
      1114: 227, 1117: 230, 1135: 248, 1147: 260, 1150: 263,
      1153: 266, 1168: 281, 1171: 284, 1180: 293, 1183: 296,
      1186: 299, 1189: 302, 1192: 305, 1195: 308, 1198: 311,
      1201: 314, 1204: 317, 1207: 320, 1210: 323, 1213: 326,
      1216: 329, 1219: 332, 1222: 335, 1225: 338, 1237: 350,
      1240: 353, 1243: 356, 1246: 359, 1249: 362, 1252: 365,
      1255: 368, 1258: 371, 1261: 374, 1264: 377, 1273: 386,
      1276: 389, 1279: 392, 1282: 395
    };
  }
};

/**
 * Get the local weather icon path based on condition code and time of day
 * @param {number} conditionCode - The weather condition code
 * @param {number} isDay - 1 for day, 0 for night
 * @param {Object} conditionsMapping - The weather conditions mapping (optional, will fetch if not provided)
 * @returns {string} The path to the local icon image
 */
const getWeatherIcon = (conditionCode, isDay, conditionsMapping = null) => {
  const iconNumber = (conditionsMapping && conditionsMapping[conditionCode]) || 113; // Default to sunny/clear
  const timeOfDay = isDay === 1 ? 'd' : 'n';
  
  // Return path to local assets/icon folder
  try {
    return `/src/assets/icon/${iconNumber}${timeOfDay}@2x.png`;
  } catch (error) {
    console.warn(`Icon not found for code ${conditionCode}, using default`);
    return `/src/assets/icon/113${timeOfDay}.png`;
  }
};

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [astronomy, setAstronomy] = useState(null);
  const [marine, setMarine] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    avgTemperature: 0,
    searchCount: 0,
    avgForecast: 0
  });
  // Unit preferences (temp: 'C'|'F', distance: 'mi'|'km')
  const [units, setUnits] = useState({ temp: 'C', distance: 'mi' });
  // Weather conditions mapping
  const [weatherConditionsMapping, setWeatherConditionsMapping] = useState(null);
  // Component visibility controls
  const [visible, setVisible] = useState({
    search: true,
    summary: true,
    nearby: true,
    current: true,
    forecast: true,
    astronomy: true,
    marine: true,
    history: true,
  });

  const toggleVisible = useCallback((key) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Fetch weather conditions mapping on component mount
  useEffect(() => {
    const loadWeatherConditions = async () => {
      const mapping = await fetchWeatherConditions();
      setWeatherConditionsMapping(mapping);
    };
    loadWeatherConditions();
  }, []);

  // Stable handler to receive unit changes from child components
  // Use useCallback so the reference doesn't change on every render.
  const handleUnitChange = useCallback((u) => {
    setUnits(prev => ({ ...prev, ...u }));
  }, []);

  // Wrapper function for getWeatherIcon that includes the mapping
  const getIconPath = useCallback((conditionCode, isDay) => {
    return getWeatherIcon(conditionCode, isDay, weatherConditionsMapping);
  }, [weatherConditionsMapping]);

  const detectLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First get the IP address from ipapi.co
      const response = await fetch(`${IPAPI_BASE_URL}/json`);
      if (!response.ok) throw new Error('Failed to fetch location data');
      
      const data = await response.json();
      
      // Use the latitude and longitude for weather search
      if (data.latitude && data.longitude) {
        const query = `${data.latitude},${data.longitude}`;
        await handleSearch(query, true); // Pass true to indicate this is initial load
      } else {
        throw new Error('Location data not available');
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      setError('Could not detect location automatically');
    } finally {
      setIsLoading(false);
    }
  };

  // Load default location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Function to handle search
  const handleSearch = async (query, isInitialLoad = false) => {
    try {
      // Clear nearby locations at the start of each search
      setNearbyLocations([]);

      const locationData = await weatherService.getIPLocation(query);
      const current = await weatherService.getCurrentWeather(query);
      const forecastData = await weatherService.getForecast(query);
      const astronomyData = await weatherService.getAstronomy(query);
      const marineData = await weatherService.getMarine(query);

      // Only get nearby locations if we have a ZIP code
      if (/^\d+$/.test(query)) {
        const countryCode = await countryService.getCountryCode(locationData.location.country);
        if (countryCode) {
          // pass selected distance unit to nearby service
          const nearby = await nearbyService.getNearbyLocations(query, countryCode, 10, units.distance);
          setNearbyLocations(nearby.results || []);
        }
      }

      // Update states
      setCurrentWeather(current);
      setForecast(forecastData);
      setAstronomy(astronomyData);
      setMarine(marineData);

      // Only update search history if this is not the initial load
      if (!isInitialLoad) {
        const newHistoryItem = {
          id: Date.now().toString(),
          query,
          current: {
            condition: current.current.condition.text,
            temp: formatTemp(current.current.temp_c, units.temp),
            icon: current.current.condition.icon
          },
          timestamp: new Date().toISOString()
        };
        setSearchHistory(prev => [newHistoryItem, ...prev]);
      }

      // Update summary statistics
      setSummary(prev => ({
        avgTemperature: current.current.temp_c,
        searchCount: prev.searchCount + 1,
        avgForecast: forecastData.forecast.forecastday[0].day.avgtemp_c
      }));

    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const weatherService = {
    // Get location data from IP or query
    getIPLocation: async (query) => {
      const response = await fetch(`${WEATHER_BASE_URL}/timezone.json?key=${WEATHER_API_KEY}&q=${query}`);
      if (!response.ok) throw new Error('Failed to fetch IP location data');
      return response.json();
    },

    // Get current weather data
    getCurrentWeather: async (query) => {
      const response = await fetch(`${WEATHER_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${query}`);
      if (!response.ok) throw new Error('Failed to fetch current weather data');
      return response.json();
    },

    // Get forecast data
    getForecast: async (query) => {
      const response = await fetch(`${WEATHER_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${query}&days=1`);
      if (!response.ok) throw new Error('Failed to fetch forecast data');
      return response.json();
    },

    // Get astronomy data
    getAstronomy: async (query) => {
      const response = await fetch(`${WEATHER_BASE_URL}/astronomy.json?key=${WEATHER_API_KEY}&q=${query}`);
      if (!response.ok) throw new Error('Failed to fetch astronomy data');
      return response.json();
    },

    // Get marine data
    getMarine: async (query) => {
      const response = await fetch(`${WEATHER_BASE_URL}/marine.json?key=${WEATHER_API_KEY}&q=${query}`);
      if (!response.ok) throw new Error('Failed to fetch marine data');
      return response.json();
    }
  };

  const countryService = {
    // Get country code from country name
    getCountryCode: async (countryName) => {
      try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
        if (!response.ok) throw new Error('Failed to fetch country data');
        const data = await response.json();
        return data[0]?.cca2.toLowerCase(); // Get the 2-letter country code
      } catch (error) {
        console.error('Error fetching country code:', error);
        return null;
      }
    }
  };

  const nearbyService = {
    // Get nearby locations based on zip code
    getNearbyLocations: async (zipCode, countryCode, radius = 10, unit = 'miles') => {
      const response = await fetch(
        `${ZIPCODE_BASE_URL}/radius?apikey=${ZIPCODE_API_KEY}&code=${zipCode}&country=${countryCode}&radius=${radius}&unit=${unit}`
      );
      if (!response.ok) throw new Error('Failed to fetch nearby locations');
      return response.json();
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          Weather & Location Dashboard
          <span>
            <sup className="powered-by">powered by</sup>
            <a href="https://www.weatherapi.com/" title="Free Weather API">
              <img src='//cdn.weatherapi.com/v4/images/weatherapi_logo.png' alt="Weather data by WeatherAPI.com" border="0"/>
            </a>
          </span>
        </h1>
        {error && <div className="error-message">{error}</div>}
      </header>

      {visible.nearby && (
        <div className="left-panel">
          <Nearby
            locations={nearbyLocations}
            onSelect={handleSearch}
            units={units}
            formatDistance={formatDistance}
          />
        </div>
      )}

      <div className="main-content">
        {visible.search && <IPLookup onSearch={handleSearch} />}

        <div className="visibility-controls">
          <div className="controls-row">
            <label><input type="checkbox" checked={visible.search} onChange={() => toggleVisible('search')} /> Search</label>
            <label><input type="checkbox" checked={visible.summary} onChange={() => toggleVisible('summary')} /> Summary</label>
            <label><input type="checkbox" checked={visible.current} onChange={() => toggleVisible('current')} /> Current</label>
            <label><input type="checkbox" checked={visible.forecast} onChange={() => toggleVisible('forecast')} /> Forecast</label>
          </div>
          <div className="controls-row">
            <label><input type="checkbox" checked={visible.astronomy} onChange={() => toggleVisible('astronomy')} /> Astronomy</label>
            <label><input type="checkbox" checked={visible.marine} onChange={() => toggleVisible('marine')} /> Marine</label>
            <label><input type="checkbox" checked={visible.nearby} onChange={() => toggleVisible('nearby')} /> Nearby</label>
            <label><input type="checkbox" checked={visible.history} onChange={() => toggleVisible('history')} /> History</label>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-message">Detecting your location...</div>
        ) : (
          visible.summary && <Summary data={summary} onUnitChange={handleUnitChange} />
        )}

        <div className="weather-info">
          {visible.current && (
            <Current data={currentWeather} units={units} formatTemp={formatTemp} formatSpeed={formatSpeed} getWeatherIcon={getIconPath} />
          )}
          {visible.forecast && (
            <Forecast data={forecast} units={units} formatTemp={formatTemp} formatSpeed={formatSpeed} mmToInches={mmToInches} getWeatherIcon={getIconPath} />
          )}
          {visible.astronomy && (
            <Astronomy data={astronomy} units={units} />
          )}
          {visible.marine && (
            <Marine data={marine} units={units} />
          )}
        </div>
      </div>

      {visible.history && (
        <div className="right-panel">
          <SearchHistory history={searchHistory} onSelect={handleSearch} />
        </div>
      )}
    </div>
  );
}

export default App;