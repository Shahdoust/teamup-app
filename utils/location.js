const axios = require("axios");
const Event = require("../schemas/Event");

// Get latitude and longitude of city
const fetchLocationUser = async (city) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=`
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
    // const response = await axios.get(
    //   `https://nominatim.openstreetmap.org/search?street=${address.houseNumber} ${address.street}, &city=${address.city}&format=json`
    // );

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${LatLng.latitude}&lon=${LatLng.longitude}`
    );
    const data = response.data;
    const city = data.address.city;
    return {
      LatLng: { latitude: LatLng.latitude, longitude: LatLng.longitude },
      address: { city },
    };
  } catch (error) {
    console.error(error);
  }
};

// getting user location (just another API)

const userLocation = async (city, country) => {
  try {
    const locationQuery = `${city}${country}`;
    const apiResponse = await axios.get(
      `http://dev.virtualearth.net/REST/v1/Locations?q=${encodeURIComponent(
        locationQuery
      )}&key=${process.env.API_KEY}`
    );
    const coordinates = apiResponse.data.resourceSets[0].resources[0].point;
    return {
      latitude: coordinates.coordinates[0],
      longitude: coordinates.coordinates[1],
    };
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  fetchLocationUser,
  fetchLocationEvent,
  userLocation,
};
