import React, { useEffect, useState } from "react";
import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import loader from "../src/loading-gif.gif";

const API_KEY = "1635890035cbba097fd5c26c8ea672a1";
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

function App() {
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init();
  }, []);

  const formatDate = (itemDate) => {
    return `${String(itemDate.getDate()).padStart(2, "0")}/${String(
      itemDate.getMonth() + 1
    ).padStart(2, "0")}/${itemDate.getFullYear()}`;
  };

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
      const nextFiveDays = [];
      let currentDate = new Date();
      data.list.forEach((item) => {
        const itemDate = new Date(item.dt * 1000);
        if (itemDate.getDate() !== currentDate.getDate()) {
          nextFiveDays.push({
            id: formatDate(itemDate),
            date: formatDate(itemDate),
            temp: item.main.temp,
            minTemp: item.main.temp_min,
            maxTemp: item.main.temp_max,
            pressure: item.main.pressure,
            humidity: item.main.humidity,
          });

          currentDate = itemDate;
          if (nextFiveDays?.length === 5) return;
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

  const handleSubmit = () => {
    if (city) fetchData(city);
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
    setForecastData([]);
    setError("");
  };

  return (
    <div className="App">
      <div className="column ">
        <h1>Weather in your city</h1>
        <div className="heading-input">
          <input
            type="text"
            value={city}
            onChange={handleInputChange}
            placeholder="Enter city name"
            className="input_btn"
          />
          <button type="submit" className="search_btn" onClick={handleSubmit}>
            <span>&#x3f;</span> Search
          </button>
          {loading && <img src={loader} alt="loading" />}
        </div>
      </div>
      <div className="forecast-container">
        {error && (
          <div className="no-data-found">
            <h3>No Data Found</h3>
            <p>{error}</p>
          </div>
        )}
        {forecastData.length > 0
          ? forecastData.map((day) => (
              <div key={day.id} data-aos="fade-up" className="weather-card">
                <table className="weather-table">
                  <tbody>
                    <tr className="date-row">
                      <td colSpan="2"> Date: {day.date} </td>
                    </tr>
                    <tr>
                      <td colSpan="2">Temperature: {day.temp}°C</td>
                    </tr>
                    <tr>
                      <th>Min</th>
                      <th>Max</th>
                    </tr>
                    <tr>
                      <td>{day.minTemp}°C</td>
                      <td>{day.maxTemp}°C</td>
                    </tr>
                    <tr>
                      <th>Pressure</th>
                      <td>{day.pressure} hPa</td>
                    </tr>
                    <tr>
                      <th>Humidity</th>
                      <td>{day.humidity}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          : !loading &&
            !error && (
              <div className="no-data-found">
                <h3>
                  Please enter a city name to get the weather forecast data for
                  the next 5 days
                </h3>
              </div>
            )}
      </div>
    </div>
  );
}

export default App;
