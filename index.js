const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

let accessToken = null;

async function getAccessToken() {
  const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', 
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET
    }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  accessToken = response.data.access_token;
  return accessToken;
}

app.post('/search', async (req, res) => {
  const { origin, destination, departureDate } = req.body;

  try {
    if (!accessToken) await getAccessToken();

    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults: 1,
        max: 5
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Flight search failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
