import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import IPLookup from '../components/IPLookup';
import Summary from '../components/Summary';
import SearchHistory from '../components/SearchHistory';
import Nearby from '../components/Nearby';
import WeatherCharts from '../components/WeatherCharts';
import { 
  formatDistance,
  WEATHER_API_KEY,
  ZIPCODE_API_KEY,
  WEATHER_BASE_URL,
  ZIPCODE_BASE_URL,
  IPAPI_BASE_URL,
  loadStateFromStorage,
  saveStateToStorage,
  useScreenWidth
} from '../App';

function ChartsView() {
  const { location: urlLocation } = useParams();
  const navigate = useNavigate();
  
  const savedState = loadStateFromStorage('chartsViewState');

  const [locations, setLocations] = useState(savedState?.locations || []);
  const [searchHistory, setSearchHistory] = useState(savedState?.searchHistory || []);
  const [nearbyLocations, setNearbyLocations] = useState(savedState?.nearbyLocations || []);
  const [isLoading, setIsLoading] = useState(savedState ? false : true);
  const [error, setError] = useState(null);
  const [units, setUnits] = useState(savedState?.units || { temp: 'F', distance: 'mi' });
  const [searchRadius, setSearchRadius] = useState(savedState?.searchRadius || 10);
  const [summary, setSummary] = useState(savedState?.summary || {
    avgTemperature: 0,
    searchCount: 0,
    avgForecast: 0
  });
  const [visible, setVisible] = useState(savedState?.visible || {
    temperature: true,
    humidity: true,
    wind: true
  });
  const screenWidth = useScreenWidth();

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (locations.length > 0) {
      const stateToSave = {
        locations,
        searchHistory,
        nearbyLocations,
        units,
        searchRadius,
        summary,
        visible
      };
      saveStateToStorage('chartsViewState', stateToSave);
    }
  }, [locations, searchHistory, nearbyLocations, units, searchRadius, summary, visible]);

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
          await handleSearch(query, true);
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
            await handleSearch(query, true);
          } catch (err) {
            console.error('Error with geolocation search:', err);
            await handleSearch('New York', true);
          } finally {
            setIsLoading(false);
          }
        },
        async (geoError) => {
          console.warn('Geolocation permission denied or failed:', geoError);
          try {
            await handleSearch('New York', true);
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
        await handleSearch('New York', true);
      } catch {
        setError('Could not load weather data. Please search for a location.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (urlLocation) {
      // Decode URL location parameter and search for it
      const decodedLocation = decodeURIComponent(urlLocation);
      handleSearch(decodedLocation, true);
    } else if (!savedState) {
      // Only detect location if there's no saved state
      detectLocation();
    }
  }, [urlLocation]);

  const handleSearch = async (query, isInitialLoad = false) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${WEATHER_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${query}`);
      if (!response.ok) throw new Error('Failed to fetch weather data');
      
      const data = await response.json();
      
      // Update URL with the searched location (unless it's the initial auto-detected location)
      if (!isInitialLoad) {
        const locationSlug = encodeURIComponent(data.location.name);
        navigate(`/charts/${locationSlug}`, { replace: true });
      }
      
      const newLocation = {
        id: `${data.location.name}-${data.location.lat}-${data.location.lon}`,
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        lat: data.location.lat,
        lon: data.location.lon,
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        humidity: data.current.humidity,
        wind_kph: data.current.wind_kph,
        wind_mph: data.current.wind_mph,
        feelslike_c: data.current.feelslike_c,
        feelslike_f: data.current.feelslike_f,
        timestamp: new Date().toISOString()
      };
      
      setLocations(prev => {
        const exists = prev.find(loc => loc.id === newLocation.id);
        if (exists) return prev;
        return [newLocation, ...prev].slice(0, 10);
      });
      
      if (!isInitialLoad) {
        const historyItem = {
          id: newLocation.id,
          query: newLocation.name,
          current: {
            icon: newLocation.icon,
            condition: newLocation.condition,
            temp: units.temp === 'F' ? `${Math.round(newLocation.temp_f)}°F` : `${Math.round(newLocation.temp_c)}°C`
          },
          timestamp: new Date().toISOString()
        };
        setSearchHistory(prev => [historyItem, ...prev].slice(0, 10));
        
        setSummary(prev => ({
          avgTemperature: newLocation.temp_c,
          searchCount: prev.searchCount + 1,
          avgForecast: newLocation.temp_c
        }));
      }
      
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
      }
      
    } catch (error) {
      console.error('Error searching location:', error);
      setError('Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnitChange = useCallback((u) => {
    setUnits(prev => ({ ...prev, ...u }));
  }, []);

  const toggleVisible = (key) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
          <Link to="/" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>
          <h2>Weather Analytics & Charts</h2>
          <p className="location-coordinates">
            <i className="fas fa-chart-line"></i> Hourly forecast data visualization
          </p>
        </div>

        <IPLookup onSearch={handleSearch} />
        
        {error && <div className="error-message">{error}</div>}
        
        {isLoading && <div className="loading-message">Loading weather data...</div>}
        
        <Summary data={summary} onUnitChange={handleUnitChange} location={locations[0]?.name} />
        
        <div className="visibility-controls">
          <div className="controls-row">
            <span className="controls-title">Chart Filter:</span>
            <label><input type="checkbox" checked={visible.temperature} onChange={() => toggleVisible('temperature')} /> Temperature</label>
            <label><input type="checkbox" checked={visible.humidity} onChange={() => toggleVisible('humidity')} /> Humidity</label>
            <label><input type="checkbox" checked={visible.wind} onChange={() => toggleVisible('wind')} /> Wind & Rain</label>
          </div>
        </div>
        
        {/* Data Visualization Charts */}
        <WeatherCharts locations={locations} units={units} visible={visible} />
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

export default ChartsView;
