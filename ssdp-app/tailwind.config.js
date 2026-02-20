/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // SSDP Official Brand Colors
        'ssdp-blue': '#136F8D',      // John Walsh Blue — PRIMARY
        'ssdp-orange': '#FAA732',    // Secondary
        'ssdp-teal': '#17BEBB',      // Accent
        'ssdp-navy': '#003249',      // Dark base
        'ssdp-chartreuse': '#DAF702', // Accent
        'ssdp-gray': '#636467',      // Neutral
      },
      fontFamily: {
        'montserrat': ['Montserrat_700Bold'],
        'opensans': ['OpenSans_400Regular'],
        'opensans-semibold': ['OpenSans_600SemiBold'],
        'opensans-bold': ['OpenSans_700Bold'],
      },
    },
  },
  plugins: [],
};
