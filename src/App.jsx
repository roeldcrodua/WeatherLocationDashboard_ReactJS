import React, { useEffect, useState } from 'react';
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
const ZIPCODE_BASE_URL = 'https://api.zipcodestack.com/v1';

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
  if (unit === 'F') return `${cToF(v).toFixed(1)}°F`;
  return `${v.toFixed(1)}°C`;
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

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [astronomy, setAstronomy] = useState(null);
  const [marine, setMarine] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [summary, setSummary] = useState({
    avgTemperature: 0,
    searchCount: 0,
    avgForecast: 0
  });
  // Unit preferences (temp: 'C'|'F', distance: 'mi'|'km')
  const [units, setUnits] = useState({ temp: 'C', distance: 'mi' });

  // Function to handle search
  const handleSearch = async (query) => {
    try {
      const locationData = await weatherService.getIPLocation(query);
      const current = await weatherService.getCurrentWeather(query);
      const forecastData = await weatherService.getForecast(query);
      const astronomyData = await weatherService.getAstronomy(query);
      const marineData = await weatherService.getMarine(query);

      // Get country code and nearby locations if we have a ZIP code
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

      // Update search history
      const newHistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: new Date().toISOString()
      };
      setSearchHistory(prev => [newHistoryItem, ...prev]);

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
        <h1>Weather & Location Dashboard</h1>
      </header>

      <div className="left-panel">
        <Nearby
          locations={nearbyLocations}
          onSelect={handleSearch}
          units={units}
          formatDistance={formatDistance}
        />
      </div>

      <div className="main-content">
        <IPLookup onSearch={handleSearch} />
        <Summary data={summary} onUnitChange={(u) => setUnits(prev => ({...prev, ...u}))} />

        <div className="weather-info">
          <Current data={currentWeather} units={units} formatTemp={formatTemp} formatSpeed={formatSpeed} />
          <Forecast data={forecast} units={units} formatTemp={formatTemp} formatSpeed={formatSpeed} mmToInches={mmToInches} />
          <Astronomy data={astronomy} units={units} />
          <Marine data={marine} units={units} />
        </div>
      </div>

      <div className="right-panel">
        <SearchHistory history={searchHistory} onSelect={handleSearch} />
      </div>
    </div>
  );
}

export default App;