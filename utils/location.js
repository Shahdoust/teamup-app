const axios = require("axios");

// Get latitude and longitude of city
const fetchLocationUser = async (city) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?city=${city}&format=json`
    );
    const data = response.data[0];
    console.log(data.lat, data.lon);
    return { lat: data.lat, lon: data.lon };
  } catch (error) {
    console.error(error);
  }
};

// Get latitude and longitude of city
const fetchLocationEvent = async (location) => {
  const { LatLng, address } = location;
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?street=${address.houseNumber} ${address.street}, &city=${address.city}&format=json`
    );

    const data = response.data[0];

    return { lat: data.lat, lon: data.lon };
  } catch (error) {
    console.error(error);
  }
};

module.exports = { fetchLocationUser, fetchLocationEvent };
