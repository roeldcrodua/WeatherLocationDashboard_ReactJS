import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import IPLookup from '../components/IPLookup';
import Current from '../components/Current';
import Forecast from '../components/Forecast';
import Astronomy from '../components/Astronomy';
import Marine from '../components/Marine';
import SearchHistory from '../components/SearchHistory';
import Nearby from '../components/Nearby';
import Summary from '../components/Summary';
import { 
  mmToInches, 
  formatTemp, 
  formatSpeed, 
  formatDistance, 
  fetchWeatherConditions, 
  getWeatherIcon,
  WEATHER_API_KEY,
  ZIPCODE_API_KEY,
  WEATHER_BASE_URL,
  ZIPCODE_BASE_URL,
  IPAPI_BASE_URL,
  loadStateFromStorage,
  saveStateToStorage,
  useScreenWidth
} from '../App';

function Dashboard() {
  const savedState = loadStateFromStorage('dashboardState');

  const [currentWeather, setCurrentWeather] = useState(savedState?.currentWeather || null);
  const [forecast, setForecast] = useState(savedState?.forecast || null);
  const [astronomy, setAstronomy] = useState(savedState?.astronomy || null);
  const [marine, setMarine] = useState(savedState?.marine || null);
  const [nearbyLocations, setNearbyLocations] = useState(savedState?.nearbyLocations || []);
  const [searchHistory, setSearchHistory] = useState(savedState?.searchHistory || []);
  const [isLoading, setIsLoading] = useState(savedState ? false : true);
  const [error, setError] = useState(null);
  const [units, setUnits] = useState(savedState?.units || { temp: 'F', distance: 'mi' });
  const [searchRadius, setSearchRadius] = useState(savedState?.searchRadius || 10);
  const [weatherConditionsMapping, setWeatherConditionsMapping] = useState(null);
  const screenWidth = useScreenWidth();
  const [visible, setVisible] = useState(savedState?.visible || {
    current: true,
    forecast: true,
    astronomy: true,
    marine: true,
  });
  const [summaryData, setSummaryData] = useState(savedState?.summaryData || {
    avgTemperature: 0,
    searchCount: 0,
    avgForecast: 0
  });

  const toggleVisible = useCallback((key) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (currentWeather) {
      const stateToSave = {
        currentWeather,
        forecast,
        astronomy,
        marine,
        nearbyLocations,
        searchHistory,
        units,
        searchRadius,
        visible,
        summaryData
      };
      saveStateToStorage('dashboardState', stateToSave);
    }
  }, [currentWeather, forecast, astronomy, marine, nearbyLocations, searchHistory, units, searchRadius, visible, summaryData]);

  // Fetch weather conditions mapping
  useEffect(() => {
    const loadWeatherConditions = async () => {
      const mapping = await fetchWeatherConditions();
      setWeatherConditionsMapping(mapping);
    };
    loadWeatherConditions();
  }, []);

  const handleUnitChange = useCallback((u) => {
    setUnits(prev => ({ ...prev, ...u }));
  }, []);

  const getIconPath = useCallback((conditionCode, isDay) => {
    return getWeatherIcon(conditionCode, isDay, weatherConditionsMapping);
  }, [weatherConditionsMapping]);

  const detectLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try ipapi.co first
      const response = await fetch(`${IPAPI_BASE_URL}/json`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.latitude && data.longitude) {
          const query = `${data.latitude},${data.longitude}`;
          await fetchWeatherForLocation(query);
          setIsLoading(false);
          return;
        }
      }
    } catch (ipError) {
      console.warn('ipapi.co failed, trying fallback:', ipError);
    }
    
    // Fallback: Try browser geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const query = `${position.coords.latitude},${position.coords.longitude}`;
            await fetchWeatherForLocation(query);
          } catch (err) {
            console.error('Error with geolocation search:', err);
            await fetchWeatherForLocation('New York');
          } finally {
            setIsLoading(false);
          }
        },
        async (geoError) => {
          console.warn('Geolocation permission denied or failed:', geoError);
          try {
            await fetchWeatherForLocation('New York');
          } catch {
            setError('Could not load weather data. Please search for a location.');
          } finally {
            setIsLoading(false);
          }
        },
        { timeout: 5000 }
      );
    } else {
      try {
        await fetchWeatherForLocation('New York');
      } catch {
        setError('Could not load weather data. Please search for a location.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Only detect location if there's no saved state
    if (!savedState) {
      detectLocation();
    }
  }, []);

  const fetchWeatherForLocation = async (query) => {
    try {
      setIsLoading(true);
      setError(null);

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
      
      // Handle nearby locations for ZIP codes
      if (/^\d+$/.test(query)) {
        try {
          const locationData = await fetch(`${WEATHER_BASE_URL}/timezone.json?key=${WEATHER_API_KEY}&q=${query}`);
          const locJson = await locationData.json();
          
          const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(locJson.location.country)}`);
          const countryData = await countryResponse.json();
          const countryCode = countryData[0]?.cca2.toLowerCase();
          
          if (countryCode) {
            const nearbyResponse = await fetch(
              `${ZIPCODE_BASE_URL}/radius?apikey=${ZIPCODE_API_KEY}&code=${query}&country=${countryCode}&radius=${searchRadius}&unit=${units.distance === 'mi' ? 'miles' : 'kilometers'}`
            );
            const nearby = await nearbyResponse.json();
            setNearbyLocations(nearby.results || []);
          }
        } catch (err) {
          console.error('Error fetching nearby locations:', err);
        }
      } else {
        // Clear nearby locations for non-ZIP searches
        setNearbyLocations([]);
      }
      
      // Add to search history
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
        const exists = prev.find(item => item.query === historyItem.query);
        if (exists) return prev;
        return [historyItem, ...prev].slice(0, 10);
      });

      // Update summary data
      setSummaryData(prev => {
        const newCount = prev.searchCount + 1;
        const currentTempC = current.current.temp_c;
        const forecastAvgTempC = forecastData.forecast.forecastday[0].day.avgtemp_c;
        const newAvgTemp = ((prev.avgTemperature * prev.searchCount) + currentTempC) / newCount;
        const newAvgForecast = ((prev.avgForecast * prev.searchCount) + forecastAvgTempC) / newCount;
        
        return {
          avgTemperature: newAvgTemp,
          searchCount: newCount,
          avgForecast: newAvgForecast
        };
      });

    } catch (err) {
      console.error('Error fetching weather details:', err);
      setError('Failed to load weather details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    await fetchWeatherForLocation(query);
  };

  if (isLoading) {
    return (
      <>
        <div className="main-content">
          <div className="loading-message">
            <i className="fas fa-spinner fa-spin"></i> Detecting your location and loading weather data...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="main-content">
          <div className="error-message">{error}</div>
          <IPLookup onSearch={handleSearch} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="left-panel">
        <Nearby
          locations={nearbyLocations}
          onSelect={handleSearch}
          units={units}
          formatDistance={formatDistance}
          searchRadius={searchRadius}
          onRadiusChange={setSearchRadius}
        />
      </div>

      <div className="main-content">
        <div className="detail-header">
          {currentWeather && (
            <Link 
              to={`/charts/${encodeURIComponent(currentWeather.location.name)}`} 
              className="analytics-charts-button"
            >
              <i className="fas fa-chart-line"></i> View Analytics Charts
            </Link>
          )}
          <h2>Weather Dashboard{currentWeather && ` - ${currentWeather.location.name}`}</h2>
          {currentWeather && (
            <p className="location-coordinates">
              <i className="fas fa-map-pin"></i> {currentWeather.location.region}, {currentWeather.location.country} • Coordinates: {currentWeather.location.lat}°, {currentWeather.location.lon}°
            </p>
          )}
        </div>

        <IPLookup onSearch={handleSearch} />

        <Summary data={summaryData} onUnitChange={handleUnitChange} />

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
              onUnitChange={handleUnitChange}
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
        {screenWidth <= 1400 && (
          <div className="bottom-nearby">
            <Nearby
              locations={nearbyLocations}
              onSelect={handleSearch}
              units={units}
              formatDistance={formatDistance}
              searchRadius={searchRadius}
              onRadiusChange={setSearchRadius}
            />
          </div>
        )}
        {screenWidth <= 900 && (
          <div className="bottom-history">
            <SearchHistory history={searchHistory} onSelect={handleSearch} />
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
