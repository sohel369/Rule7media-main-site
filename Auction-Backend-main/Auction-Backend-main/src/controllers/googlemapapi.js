import dotenv from "dotenv";
dotenv.config();
export const getGoogleMapsApiKey = (req, res) => {
  res.json({
    key: process.env.GOOGLE_MAPS_API_KEY,
    libraries: 'places,geocoding'
  });
};

