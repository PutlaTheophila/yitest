const puppeteer = require('puppeteer');


const axios = require('axios');

const resolveMapsLink = async (shortUrl) => {
  try {
    const response = await axios.head(shortUrl, {
      maxRedirects: 10,
      headers: {
        'User-Agent': 'Mozilla/5.0', // mimic browser
      },
    });

    return response.request.res.responseUrl || shortUrl;
  } catch (err) {
    console.error('Failed to resolve map link:', err.message);
    return shortUrl; // fallback
  }
};


module.exports = resolveMapsLink;
