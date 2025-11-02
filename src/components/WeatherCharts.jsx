import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { WEATHER_API_KEY, WEATHER_BASE_URL } from '../App';

function WeatherCharts({ locations, units, visible }) {
  const [hourlyData, setHourlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchHourlyForecast = async () => {
      if (!locations || locations.length === 0) {
        setHourlyData([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // Get forecast for the first location (or you can aggregate multiple locations)
        const location = locations[0];
        const query = `${location.lat},${location.lon}`;
        
        const response = await fetch(`${WEATHER_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${query}&days=1`);
        if (!response.ok) throw new Error('Failed to fetch hourly forecast');
        
        const data = await response.json();
        const hours = data.forecast.forecastday[0].hour;
        
        // Format hourly data for charts
        const formattedData = hours.map(hour => {
          const time = new Date(hour.time);
          const hourLabel = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
          
          return {
            time: hourLabel,
            temperature: units.temp === 'F' ? Math.round(hour.temp_f) : Math.round(hour.temp_c),
            feelsLike: units.temp === 'F' ? Math.round(hour.feelslike_f) : Math.round(hour.feelslike_c),
            humidity: hour.humidity,
            windSpeed: units.distance === 'mi' ? hour.wind_mph : hour.wind_kph,
            chanceOfRain: hour.chance_of_rain,
            condition: hour.condition.text
          };
        });
        
        setHourlyData(formattedData);
      } catch (error) {
        console.error('Error fetching hourly forecast:', error);
        setHourlyData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHourlyForecast();
  }, [locations, units]);
  
  if (!locations || locations.length === 0) {
    return (
      <div className="weather-card">
        <h2><i className="fas fa-chart-line"></i> Weather Analytics</h2>
        <p className="text-muted">Search for locations to see weather analytics</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="weather-card">
        <h2><i className="fas fa-chart-line"></i> Hourly Forecast Charts</h2>
        <p className="text-muted"><i className="fas fa-spinner fa-spin"></i> Loading hourly forecast data...</p>
      </div>
    );
  }
  
  if (hourlyData.length === 0) {
    return (
      <div className="weather-card">
        <h2><i className="fas fa-chart-line"></i> Hourly Forecast Charts</h2>
        <p className="text-muted">No hourly data available</p>
      </div>
    );
  }

  // Sample every 2nd hour for cleaner display (12 data points instead of 24)
  const sampledData = hourlyData.filter((_, index) => index % 2 === 0);

  return (
    <div className="charts-container">
      {/* Chart 1: Hourly Temperature Forecast */}
      {visible.temperature && (
      <div className="weather-card chart-card">
        <h2><i className="fas fa-temperature-high"></i> Hourly Temperature Forecast - {locations[0].name}</h2>
        <p className="chart-description">
          24-hour temperature forecast - Actual vs. Feels Like
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampledData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.7)" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)" 
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              label={{ 
                value: units.temp === 'F' ? 'Temperature (°F)' : 'Temperature (°C)', 
                angle: -90, 
                position: 'insideLeft',
                fill: 'rgba(255,255,255,0.7)'
              }}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#FF8042" 
              strokeWidth={3}
              name="Actual Temp"
              dot={{ fill: '#FF8042', r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="feelsLike" 
              stroke="#00C49F" 
              strokeWidth={3}
              name="Feels Like"
              dot={{ fill: '#00C49F', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Chart 2: Hourly Humidity Forecast */}
      {visible.humidity && (
      <div className="weather-card chart-card">
        <h2><i className="fas fa-droplet"></i> Hourly Humidity Forecast - {locations[0].name}</h2>
        <p className="chart-description">
          24-hour humidity forecast showing percentage of moisture in the air
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampledData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.7)" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)" 
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              label={{ 
                value: 'Humidity (%)', 
                angle: -90, 
                position: 'insideLeft',
                fill: 'rgba(255,255,255,0.7)'
              }}
              domain={[0, 100]}
            />
            <Tooltip />
            <Bar 
              dataKey="humidity" 
              fill="#0088FE" 
              name="Humidity (%)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Chart 3: Hourly Wind Speed & Rain Chance */}
      {visible.wind && (
      <div className="weather-card chart-card">
        <h2><i className="fas fa-wind"></i> Hourly Wind Speed & Rain Probability - {locations[0].name}</h2>
        <p className="chart-description">
          Combined view of wind speed and chance of rain throughout the day
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampledData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.7)" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              yAxisId="left"
              stroke="rgba(255,255,255,0.7)" 
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              label={{ 
                value: `Wind Speed (${units.distance === 'mi' ? 'mph' : 'km/h'})`, 
                angle: -90, 
                position: 'insideLeft',
                fill: 'rgba(255,255,255,0.7)'
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="rgba(255,255,255,0.7)" 
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              label={{ 
                value: 'Rain Chance (%)', 
                angle: 90, 
                position: 'insideRight',
                fill: 'rgba(255,255,255,0.7)'
              }}
              domain={[0, 100]}
            />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="windSpeed" 
              stroke="#00C49F" 
              strokeWidth={3}
              name="Wind Speed"
              dot={{ fill: '#00C49F', r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="chanceOfRain" 
              stroke="#0088FE" 
              strokeWidth={3}
              name="Rain Chance (%)"
              dot={{ fill: '#0088FE', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}

export default WeatherCharts;
