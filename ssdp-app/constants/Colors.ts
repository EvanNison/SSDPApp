// SSDP Official Brand Colors
export const brand = {
  blue: '#136F8D',        // John Walsh Blue — PRIMARY
  orange: '#FAA732',      // Secondary
  teal: '#17BEBB',        // Accent
  navy: '#003249',        // Dark base
  chartreuse: '#DAF702',  // Accent
  gray: '#636467',        // Neutral
  white: '#FFFFFF',
  black: '#000000',
} as const;

export default {
  light: {
    text: brand.navy,
    background: brand.white,
    tint: brand.blue,
    tabIconDefault: brand.gray,
    tabIconSelected: brand.blue,
    card: brand.white,
    border: '#E5E7EB',
  },
  dark: {
    text: brand.white,
    background: brand.navy,
    tint: brand.teal,
    tabIconDefault: brand.gray,
    tabIconSelected: brand.teal,
    card: '#0A1F33',
    border: '#1A3A52',
  },
};
