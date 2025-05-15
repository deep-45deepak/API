const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const port = parseInt(process.env.PORT) || process.argv[3] || 4041;

const allowedUnlimitedOrigin = 'https://5173-idx-test-1746513538955.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev/';

// Logger middleware
app.use(morgan('dev'));

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === allowedUnlimitedOrigin) {
      callback(null, true);
    } else {
      callback(null, true); // Still allow other origins but they'll be rate-limited
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Dynamic rate limiter
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req, res) => {
    // Allow unlimited access for the specific origin
    if (req.headers.origin === allowedUnlimitedOrigin) return 0;
    return 10; // All others limited to 10 requests per day
  },
  message: 'You have exceeded the 10 requests per day limit!',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Static files and views
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
      console.error("Error reading DomesticTrip.json:", err);
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
      console.error("Error reading ForeignTrip.json:", err);
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

// Weather & location info route
app.get('/location-info', async (req, res) => {
  const { city, state } = req.query;

  if (!city || !state) {
    return res.status(400).json({ error: "Both city and state are required" });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoRes = await axios.get(geoUrl);

    if (!geoRes.data?.results?.length) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { latitude, longitude, name, admin1, country } = geoRes.data.results[0];

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${name}, ${admin1}, ${country}`)}`;
    const nominatimRes = await axios.get(nominatimUrl, {
      headers: { 'User-Agent': 'TripPlanner/1.0 (dpk.41deep@gmail.com)' }
    });

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherRes = await axios.get(weatherUrl);

    res.json({
      location: {
        city: name,
        state: admin1,
        country,
        latitude,
        longitude
      },
      weather: weatherRes.data?.daily || {},
      facilities: nominatimRes.data
    });

  } catch (error) {
    console.error("Error in /location-info:", error.message);
    res.status(500).json({ 
      error: "Server error",
      details: error.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
