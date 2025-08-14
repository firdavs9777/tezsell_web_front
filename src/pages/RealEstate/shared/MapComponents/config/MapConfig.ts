// src/pages/RealEstate/shared/MapComponents/config/mapConfig.ts

export const defaultMapConfig = {
  center: [41.2995, 69.2401] as [number, number], // Tashkent center
  zoom: 11,
  minZoom: 3,
  maxZoom: 18,
};

export const tileProviders = {
  openStreetMap: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors'
  }
};

export const propertyMarkerConfig = {
  sale: {
    color: '#10B981',
    fillColor: '#10B981',
    radius: 12
  },
  rent: {
    color: '#3B82F6',
    fillColor: '#3B82F6',
    radius: 12
  },
  featured: {
    color: '#F59E0B',
    fillColor: '#F59E0B',
    radius: 16
  }
};

export const uzbekistanCities = {
  tashkent: {
    name: 'Tashkent',
    lat: 41.2995,
    lng: 69.2401,
    zoom: 11
  },
  samarkand: {
    name: 'Samarkand',
    lat: 39.6270,
    lng: 66.9750,
    zoom: 12
  },
  bukhara: {
    name: 'Bukhara',
    lat: 39.7747,
    lng: 64.4286,
    zoom: 12
  },
  andijan: {
    name: 'Andijan',
    lat: 40.7821,
    lng: 72.3442,
    zoom: 12
  },
  namangan: {
    name: 'Namangan',
    lat: 40.9983,
    lng: 71.6726,
    zoom: 12
  },
  fergana: {
    name: 'Fergana',
    lat: 40.3834,
    lng: 71.7847,
    zoom: 12
  },
  nukus: {
    name: 'Nukus',
    lat: 42.4531,
    lng: 59.6103,
    zoom: 12
  },
  urgench: {
    name: 'Urgench',
    lat: 41.5506,
    lng: 60.6314,
    zoom: 12
  },
  gulistan: {
    name: 'Gulistan',
    lat: 40.4897,
    lng: 68.7844,
    zoom: 12
  },
  qarshi: {
    name: 'Qarshi',
    lat: 38.8606,
    lng: 65.7892,
    zoom: 12
  },
  jizzakh: {
    name: 'Jizzakh',
    lat: 40.1158,
    lng: 67.8422,
    zoom: 12
  },
  termez: {
    name: 'Termez',
    lat: 37.2242,
    lng: 67.2783,
    zoom: 12
  }
};
