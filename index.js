const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = parseInt(process.env.PORT) || process.argv[3] || 4041;

// CORS
app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Static files & Views
app.use(express.static(path.join(__dirname, 'public')))
   .set('views', path.join(__dirname, 'views'))
   .set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api', (req, res) => {
  res.json({ msg: "Hello world" });
});

app.get('/preferences/domestic-trip', (req, res) => {
  fs.readFile('./DomesticTrip.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: 'Failed to load preferences' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

app.get('/preferences/foreign-trip', (req, res) => {
  fs.readFile('./ForeignTrip.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: 'Failed to load preferences' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});


app.get('/location-info', async (req, res) => {
  const { city, state } = req.query;

  if (!city || !state) {
    return res.status(400).json({ error: "Both city and state are required" });
  }

  try {
    // 1. Get coordinates from Open-Meteo
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoRes = await axios.get(geoUrl);
    
    if (!geoRes.data?.results?.length) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { latitude, longitude, name, admin1, country } = geoRes.data.results[0];

    // 2. Get EXACT Nominatim response
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${name}, ${admin1}, ${country}`)}`;
    const nominatimRes = await axios.get(nominatimUrl, {
      headers: { 'User-Agent': 'YourApp/1.0 (contact@yourdomain.com)' }
    });

    // 3. Return raw Nominatim data in 'facilities' key
    res.json({
      location: {
        city: name,
        state: admin1,
        country,
        latitude,
        longitude
      },
      weather: {}, // Your weather data here
      facilities: nominatimRes.data // Exact Nominatim response
    });

  } catch (error) {
    res.status(500).json({ 
      error: "Server error",
      details: error.message 
    });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
