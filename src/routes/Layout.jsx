import { Outlet, Link } from 'react-router-dom';
import '../App.css';

function Layout() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          <Link to="/">
            Weather & Location Dashboard
          </Link>
          <span>
            <sup className="powered-by">powered by</sup>
            <a href="https://www.weatherapi.com/" title="Free Weather API">
              <img 
                src='//cdn.weatherapi.com/v4/images/weatherapi_logo.png' 
                alt="Weather data by WeatherAPI.com" 
                border="0"
              />
            </a>
          </span>
        </h1>
      </header>
      <Outlet />
    </div>
  );
}

export default Layout;
