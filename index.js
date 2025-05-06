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
  origin: 'https://5173-idx-full-app-1746337034808.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
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

// Combined API for Location Info
app.get('/location-info', async (req, res) => {
  const { city, state } = req.query;

  if (!city || !state) {
    return res.status(400).json({ error: "City and state are required" });
  }

  try {
    const locationName = `${city}, ${state}`;

    // Step 1: Get geocoding info
    const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}`);
    const location = geoRes.data.results?.[0];

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { latitude, longitude, name, country } = location;

    // Step 2: Weather forecast
    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weathercode&timezone=auto`);

    // Step 3: Facilities via Nominatim
    const nominatimRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);

    // Combined response
    res.json({
      location: {
        city: name,
        state,
        country,
        latitude,
        longitude
      },
      weather: weatherRes.data.daily,
      facilities: nominatimRes.data
    });

  } catch (error) {
    console.error("Error in /location-info:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
