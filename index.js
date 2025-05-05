const express = require('express');
const path = require('path')
const fs = require('fs');

const app = express();

const port = parseInt(process.env.PORT) || process.argv[3] || 4041;

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api', (req, res) => {
  res.json({"msg": "Hello world"});
});

app.get('/preferences/domestic-trip', (req, res) => {
  fs.readFile('./DomesticTrip.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err); // Log for debugging
      return res.status(500).json({ error: 'Failed to load preferences' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr); // Log parse error
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

app.get('/preferences/foreign-trip', (req, res) => {
  fs.readFile('./ForeignTrip.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err); // Log for debugging
      return res.status(500).json({ error: 'Failed to load preferences' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr); // Log parse error
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});


app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
})