import React, { useEffect, useState } from "react";
import "./App.css";
import AOS from "aos";
import 'aos/dist/aos.css';

const API_KEY = "1635890035cbba097fd5c26c8ea672a1";
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

function App() {
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("individual");

  useEffect(() => {
    AOS.init();
  }, []);

  const fetchData = async (city) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      const currentDate = new Date();
      const nextFiveDays = [];
      data.list.forEach((item) => {
        const itemDate = new Date(item.dt * 1000);
        if (itemDate.getDate() !== currentDate.getDate()) {
          nextFiveDays.push(item);
          if (nextFiveDays.length === 5) {
            return nextFiveDays;
          }
        }
      });
      setForecastData(nextFiveDays);
    } catch (error) {
      setError("No data found for your search");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city) {
      fetchData(city);
    }
  };

  const groupByDay = (data) => {
    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString("en-US");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
    return Object.entries(groupedData);
  };

  return (
    <div className="App">
      <h1>
        5-Day Weather Forecast {city && forecastData.length > 0 && `- ${city}`}
      </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setForecastData([]);
            setError("");
          }}
          placeholder="Enter city name"
          className="input_btn"
        />
        <button type="submit" className="search_btn">
          Search
        </button>
      </form>
      <div className="tabs">
        <button
          className={`tab ${activeTab === "individual" ? "active" : ""}`}
          onClick={() => setActiveTab("individual")}
        >
          Individual
        </button>
        <button
          className={`tab ${activeTab === "grouped" ? "active" : ""}`}
          onClick={() => setActiveTab("grouped")}
        >
          Grouped by Day
        </button>
      </div>
      <div className="forecast-container">
        {loading && <p>Loading...</p>}
        {error && (
          <div className="no-data-found">
            <h3>No Data Found</h3>
            <p>{error}</p>
          </div>
        )}
        {forecastData.length > 0 && activeTab === "individual" && (
          forecastData.map((day, index) => (
            <div key={index} data-aos="fade-up" className="weather-card">
              <div className="weather-content">
                <img
                  className="sun"
                  alt="sun_image"
                  src="https://cdn2.iconfinder.com/data/icons/weather-flat-14/64/weather02-512.png"
                />
                <h2>
                  {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </h2>
                <p>{new Date(day.dt * 1000).toLocaleString()}</p>
                <p>Temperature: {day.main.temp}°C</p>
                <p>Description: {day.weather[0].description}</p>
              </div>
            </div>
          ))
        )}
        {forecastData.length > 0 && activeTab === "grouped" && (
          groupByDay(forecastData).map(([date, items], index) => (
            <div key={index} data-aos="fade-up" className="weather-card full-width">
              <div className="weather-content">
                <h2>{date + ' - ' + new Date(items[0]?.dt * 1000).toLocaleDateString("en-US", {
                  weekday: "long",
                })}</h2>
                {items.map((item, idx) => (
                  <div key={idx} className="weather-row">
                    <p>{new Date(item.dt * 1000).toLocaleTimeString()}</p>
                    <p>Temperature: {item.main.temp}°C</p>
                    <p>Description: {item.weather[0].description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        {!loading && !error && forecastData.length === 0 && (
          <div className="no-data-found">
            <h3>Please enter a city name to get the weather forecast data for the next 5 days</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
