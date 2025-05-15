# 🌍 Travel Assistant API

A smart travel backend built with **Node.js + Express** that combines **geolocation**, **weather forecasts**, and **facility information** to help users plan trips based on their selected city and state.

---

## 🚀 Features

- 🔍 **Geolocation Search**  
  Get latitude & longitude of a city using Open-Meteo's free geocoding API.

- 🌦 **Weather Forecast**  
  Fetch 5-day daily max/min temperature forecasts using Open-Meteo’s weather API.

- 🏥 **Nearby Facilities & Landmarks**  
  Uses OpenStreetMap Nominatim API to get nearby points of interest.

- 🛡️ **Security & Rate Limiting**  
  Prevents abuse with express-rate-limit and CORS configuration.

- 📦 **Organized API Structure**  
  Express.js server with routes for `/location-info`, preferences for trips, and static view.

---

## 📁 Folder Structure

```
.
├── views/              # EJS views for testing
├── public/             # Static files
├── DomesticTrip.json   # Sample preference file (domestic)
├── ForeignTrip.json    # Sample preference file (foreign)
├── index.js            # Main server file
```

---

## 🔗 Sample API Usage

**GET** `/location-info?city=faridabad&state=ap`

### ✅ Example Response:
```json
{
  "location": {
    "city": "Faridabad",
    "state": "Andhra Pradesh",
    "country": "India",
    "latitude": 28.41,
    "longitude": 77.31
  },
  "weather": {
    "temperature_2m_max": [...],
    "temperature_2m_min": [...]
  },
  "facilities": [ {...}, {...}, ... ]
}
```

---

## ⚙️ How to Run Locally

```bash
git clone https://github.com/your-username/travel-assistant-api.git
cd travel-assistant-api
npm install
node index.js
```

Server will run on: `http://localhost:4041`

---

## 🌐 Deployed API

> 🔗 [Live on Render](https://api-adfs.onrender.com)

Try:  
`https://api-adfs.onrender.com/location-info?city=delhi&state=delhi`

---

## 📦 Dependencies

- express
- axios
- cors
- express-rate-limit
- morgan
- ejs
- fs (Node.js built-in)
- path (Node.js built-in)

---

## 🧾 APIs Used

| API                                | Purpose                     | Free Tier? |
|-----------------------------------|-----------------------------|------------|
| [Open-Meteo](https://open-meteo.com)        | Weather + Geocoding         | ✅ Yes      |
| [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) | Facility Search              | ✅ Yes      |

✅ All APIs used are free, no keys required, and suitable for personal or academic use.

---

## 📄 License

This project is open for educational and personal use. Please credit the public APIs used.

---

## 🙋‍♂️ Author

**Deepak Kumar**  
🚀 B.Tech CSE | Backend Developer | Travel Tech Enthusiast  
📧 `dpk.41deep@gmail.com`

---
