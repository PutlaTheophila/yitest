// const puppeteer = require('puppeteer');


// const axios = require('axios');

// const resolveMapsLink = async (shortUrl) => {
//   try {
//     const response = await axios.head(shortUrl, {
//       maxRedirects: 10,
//       headers: {
//         'User-Agent': 'Mozilla/5.0', // mimic browser
//       },
//     });

//     return response.request.res.responseUrl || shortUrl;
//   } catch (err) {
//     console.error('Failed to resolve map link:', err.message);
//     return shortUrl; // fallback
//   }
// };


// module.exports = resolveMapsLink;



const axios = require("axios");
const { URL } = require("url");
require('dotenv').config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_API_KEY';

// Function to get coordinates from place_id using Google Geocoding API
const getCoordinatesFromPlaceId = async (placeId) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const location = response.data.results[0]?.geometry?.location;

    if (location) {
      // Return as string
      return `${location.lat},${location.lng}`;
    } else {
      throw new Error('Coordinates not found from placeId');
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error.message);
    return null;
  }
};

// Extract place_id from URL if available
const extractPlaceIdFromUrl = (url) => {
  const match = url.match(/place_id=([^&]+)/);
  return match ? match[1] : null;
};


// Extract lat,lng from URL if available
const extractLatLngFromUrl = (url) => {
  // Match @lat,lng
  let match = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (match) return `${match[1]},${match[2]}`;

  // Match !3dlat!4dlng
  match = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (match) return `${match[1]},${match[2]}`;

  // Match /place/lat,lng
  match = url.match(/\/place\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (match) return `${match[1]},${match[2]}`;

  return null;
};


// Main function to resolve any Google Maps URL
const getLatLngFromGoogleMapsUrl = async (url) => {
  try {
    if (!url) return null;

    // Try extracting lat,lng directly from URL
    const coords = extractLatLngFromUrl(url);
    if (coords) return coords;

    // Try extracting place_id from URL
    const placeId = extractPlaceIdFromUrl(url);
    if (placeId) return await getCoordinatesFromPlaceId(placeId);

    // If it's a short URL, follow redirects to get final URL
    const response = await axios.head(url, { maxRedirects: 5 });
    const finalUrl = response.request.res.responseUrl || response.request.res.headers.location;

    if (!finalUrl) return null;

    // Retry extraction on final URL
    const finalCoords = extractLatLngFromUrl(finalUrl);
    if (finalCoords) return finalCoords;

    const finalPlaceId = extractPlaceIdFromUrl(finalUrl);
    if (finalPlaceId) return await getCoordinatesFromPlaceId(finalPlaceId);

    return null;
  } catch (error) {
    console.error("Failed to resolve Google Maps URL:", error.message);
    return null;
  }
};

module.exports = getLatLngFromGoogleMapsUrl;
