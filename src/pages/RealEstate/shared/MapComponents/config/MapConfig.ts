// src/shared/MapComponents/config/mapConfig.ts
export const uzbekistanCities = {
  tashkent: { coords: [41.2995, 69.2401], zoom: 11, name: "Tashkent" },
  samarkand: { coords: [39.6270, 66.9750], zoom: 12, name: "Samarkand" },
  bukhara: { coords: [39.7747, 64.4286], zoom: 12, name: "Bukhara" },
  nukus: { coords: [42.4731, 59.6103], zoom: 12, name: "Nukus" },
  andijan: { coords: [40.7821, 72.3442], zoom: 12, name: "Andijan" },
  namangan: { coords: [40.9983, 71.6726], zoom: 12, name: "Namangan" },
  fergana: { coords: [40.3842, 71.7846], zoom: 12, name: "Fergana" },
  karshi: { coords: [38.8606, 65.7975], zoom: 12, name: "Karshi" },
  termez: { coords: [37.2242, 67.2783], zoom: 12, name: "Termez" },
  urgench: { coords: [41.5509, 60.6310], zoom: 12, name: "Urgench" }
} as const;

export const tashkentDistricts = {
  yunusabad: { coords: [41.3656, 69.2891], name: "Yunusabad" },
  chilanzar: { coords: [41.2751, 69.2034], name: "Chilanzar" },
  shaykhantaur: { coords: [41.3231, 69.2897], name: "Shaykhantaur" },
  mirobod: { coords: [41.2865, 69.2734], name: "Mirobod" },
  almazar: { coords: [41.3479, 69.2348], name: "Almazar" },
  bektemir: { coords: [41.2081, 69.3370], name: "Bektemir" },
  sergeli: { coords: [41.2265, 69.2265], name: "Sergeli" },
  uchtepa: { coords: [41.2876, 69.1864], name: "Uchtepa" },
  yashnaabad: { coords: [41.2632, 69.3201], name: "Yashnaabad" },
  olmazor: { coords: [41.3145, 69.2428], name: "Olmazor" },
  hamza: { coords: [41.3542, 69.2156], name: "Hamza" }
} as const;

export const tileProviders = {
  openStreetMap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: "Street Map"
  },
  cartoDB: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: "Light Map"
  },
  cartoDBDark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: "Dark Map"
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    name: "Satellite"
  }
} as const;

export const uzbekistanBounds = {
  // Uzbekistan country bounds
  southWest: [37.0, 55.0] as [number, number],
  northEast: [45.5, 73.5] as [number, number]
};

export const defaultMapConfig = {
  center: uzbekistanCities.tashkent.coords as [number, number],
  zoom: 10,
  minZoom: 6,
  maxZoom: 18,
  zoomControl: true,
  scrollWheelZoom: true
};

export const propertyMarkerConfig = {
  sale: {
    color: '#10B981',
    fillColor: '#10B981',
    fillOpacity: 0.8,
    radius: 8
  },
  rent: {
    color: '#3B82F6',
    fillColor: '#3B82F6',
    fillOpacity: 0.8,
    radius: 8
  },
  featured: {
    color: '#F59E0B',
    fillColor: '#F59E0B',
    fillOpacity: 0.9,
    radius: 10
  }
};
