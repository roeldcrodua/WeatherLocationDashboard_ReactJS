import { useEffect, useState } from 'react';
import './App.css'

// API Configuration Constants (exported for use in route components)
export const WEATHER_API_KEY = import.meta.env.VITE_WEATHERAPI_KEY;
export const ZIPCODE_API_KEY = import.meta.env.VITE_ZIPCODESTACK_KEY;
export const WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';
export const ZIPCODE_BASE_URL = 'https://app.zipcodebase.com/api/v1';
export const IPAPI_BASE_URL = 'https://ipapi.co';

// Internal temperature conversion utilities
const cToF = (c) => (c * 9) / 5 + 32;

// Internal speed conversion utilities
const kphToMph = (kph) => kph / 1.60934;

// Distance/Precipitation conversion utilities
export const mmToInches = (mm) => mm / 25.4;

// Format temperature based on unit preference
export const formatTemp = (valueC, unit = 'C') => {
  const val = Number(valueC) || 0;
  if (unit === 'F') {
    return `${Math.round(cToF(val))}°F`;
  }
  return `${Math.round(val)}°C`;
};

// Format speed based on unit preference
export const formatSpeed = (kph, units) => {
  if (units?.distance === 'mi') {
    return `${kphToMph(kph).toFixed(1)} mph`;
  }
  return `${kph.toFixed(1)} km/h`;
};

// Format distance based on unit preference
export const formatDistance = (value, units) => {
  if (units?.distance === 'mi') {
    return `${value.toFixed(1)} mi`;
  }
  return `${(value * 1.60934).toFixed(1)} km`;
};

// Cache for weather conditions to avoid repeated API calls
let weatherConditionsCache = null;

/**
 * Fetch weather condition codes to icon mapping from WeatherAPI
 * @returns {Promise<Object>} Mapping of condition codes to icon numbers
 */
export const fetchWeatherConditions = async () => {
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
export const getWeatherIcon = (conditionCode, isDay, conditionsMapping = null) => {
  const iconNumber = (conditionsMapping && conditionsMapping[conditionCode]) || 113; // Default to sunny/clear
  const timeOfDay = isDay === 1 ? 'd' : 'n';
  
  // Use relative path that works in both dev and production
  // Vite will handle the asset paths during build
  try {
    return new URL(`./assets/icon/${iconNumber}${timeOfDay}@2x.png`, import.meta.url).href;
  } catch {
    console.warn(`Icon not found for code ${conditionCode}, using default`);
    return new URL(`./assets/icon/113${timeOfDay}.png`, import.meta.url).href;
  }
};

/**
 * Utility function to load state from sessionStorage
 * @param {string} key - The sessionStorage key to load from
 * @returns {Object|null} The parsed state object or null if not found/error
 */
export const loadStateFromStorage = (key) => {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error(`Error loading state from ${key}:`, e);
    return null;
  }
};

/**
 * Utility function to save state to sessionStorage
 * @param {string} key - The sessionStorage key to save to
 * @param {Object} state - The state object to save
 */
export const saveStateToStorage = (key, state) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error(`Error saving state to ${key}:`, e);
  }
};

/**
 * Custom hook for screen width detection
 * @returns {number} Current screen width
 */
export const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return screenWidth;
};