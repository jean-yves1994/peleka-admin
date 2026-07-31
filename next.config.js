/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    NEXT_PUBLIC_CITY_NAME: process.env.NEXT_PUBLIC_CITY_NAME || 'Kigali',
    NEXT_PUBLIC_CITY_LAT: process.env.NEXT_PUBLIC_CITY_LAT || '-1.9441',
    NEXT_PUBLIC_CITY_LNG: process.env.NEXT_PUBLIC_CITY_LNG || '30.0619',
  },
};
module.exports = nextConfig;
