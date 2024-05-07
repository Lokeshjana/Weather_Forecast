import React, { useEffect, useState } from "react";
import "./App.css";
import AOS from "aos";
import 'aos/dist/aos.css';
const API_KEY = "1635890035cbba097fd5c26c8ea672a1";
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

function App() {
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState("");

  useEffect(() => {
    AOS.init();
  }, []);

  const NoDataFound = () => {
    return (
      <div className="no-data-found">
        <h3>No Data Found</h3>
        <p>Sorry, no weather data is available for the selected city.</p>
      </div>
    );
  };

  const fetchData = async (city) => {
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
      console.error("Error fetching weather data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      fetchData(city);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  return (
    <div className="App">
      <h1>
        5-Day Weather Forecast {city && forecastData?.length > 0 && "- " + city}
      </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setForecastData([]);
          }}
          placeholder="Enter city name"
          className="input_btn"
        />
        <button type="submit" className="search_btn">
          Search
        </button>
      </form>
      <div className="forecast-container">
        {forecastData?.length > 0 &&
          forecastData.map((day, index) => (
            <div data-aos="fade-up">
              <div className="weather-card" key={index}>
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
            </div>
          ))}
        {city === "" ? (
          <div className="no-data-found">
            <h3>
              Please enter city name to get weather forecast data for next 5
              days{" "}
            </h3>
          </div>
        ) : (
          city && forecastData?.length === 0 && <NoDataFound />
        )}
      </div>
    </div>
  );
}

export default App;
