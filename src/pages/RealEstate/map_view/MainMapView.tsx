import { useGetPropertiesQuery } from "@store/slices/realEstate";
import { Property, PropertyOwner, RealEstateAgent } from "@store/type";
import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {  useNavigate } from "react-router-dom";

interface ExtendedProperty extends Omit<Property, 'owner' | 'agent'> {
  owner?: PropertyOwner;
  agent?: RealEstateAgent;
  // Add coordinates for map
  latitude?: number;
  longitude?: number;
  main_image?: string;
}

const MainMapComp = () => {
  const tileProviders = {
    openStreetMap: {
      name: 'Street Map',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    }
  };

  const getPropertyWithCoordinates = (property: ExtendedProperty): ExtendedProperty => {
    if (property.latitude && property.longitude) {
      return property;
    }

    // Mock coordinates based on district (Tashkent districts)
    const districtCoordinates: Record<string, [number, number]> = {
      'yunusabad': [41.3656, 69.2891],
      'chilanzar': [41.2751, 69.2034],
      'shaykhantaur': [41.3231, 69.2897],
      'mirobod': [41.2865, 69.2734],
      'almazar': [41.3479, 69.2348],
      'bektemir': [41.2081, 69.3370],
      'sergeli': [41.2265, 69.2265],
      'uchtepa': [41.2876, 69.1864],
      'yashnaabad': [41.2632, 69.3201],
      'olmazor': [41.3145, 69.2428],
    };

    const districtKey = property.district?.toLowerCase().replace(/\s+/g, '');
    const coords = districtCoordinates[districtKey] || [41.2995, 69.2401]; // Default to Tashkent center

    return {
      ...property,
      latitude: coords[0],
      longitude: coords[1]
    };
  };

  // Fetch all properties
  const {
    data: propertiesResponse,
    isLoading,
    error
  } = useGetPropertiesQuery({
    page: 1,
    limit: 100 // Adjust as needed
  });
const navigate = useNavigate();
const redirectHandler = (id: string) => navigate(`/properties/${id}`);

  const [mapStyle, setMapStyle] = useState('openStreetMap');

  const convertToMapProperty = (property: ExtendedProperty): any => {
    const withCoords = getPropertyWithCoordinates(property);
    return {
      id: withCoords.id,
      title: withCoords.title,
      latitude: withCoords.latitude || 41.2995,
      longitude: withCoords.longitude || 69.2401,
      price: withCoords.price,
      currency: withCoords.currency,
      listing_type: withCoords.listing_type,
      property_type: withCoords.property_type,
      is_featured: withCoords.is_featured,
      district: withCoords.district,
      city: withCoords.city,
      bedrooms: withCoords.bedrooms,
      bathrooms: withCoords.bathrooms,
      square_meters: withCoords.square_meters,
      main_image: withCoords.main_image
    };
  };

  // Convert all properties for map display
  const propertiesForMap = propertiesResponse?.results
    ? propertiesResponse.results.map(convertToMapProperty)
    : [];

  console.log('Properties for map:', propertiesForMap);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading properties: {JSON.stringify(error)}
      </div>
    );
  }
 return (
    <div>
      <h1>Main Map Screen</h1>
      <div className="mb-4">
        <p>Found {propertiesForMap.length} properties</p>


      </div>

      <MapContainer
        center={[41.2995, 69.2401]} // Default Tashkent coordinates
        zoom={12}
        minZoom={5}
        maxZoom={18}
        style={{ height: '600px', width: '100%' }}
        className="rounded-lg"
        zoomControl={true}
        closePopupOnClick={true}
      >
        <TileLayer
          url={tileProviders[mapStyle as keyof typeof tileProviders]?.url || tileProviders.openStreetMap.url}
          attribution={tileProviders[mapStyle as keyof typeof tileProviders]?.attribution}
          key={mapStyle}
        />

        {/* Render property markers */}
        {propertiesForMap.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
          >
            <Popup closeOnClick={false}>

              <div className="w-64">
                <h3 className="font-bold text-lg mb-2">{property.title}</h3>

                {property.main_image && (
                  <img
                    src={property.main_image}
                    alt={property.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}

                <div className="mb-2">
                  <span className="text-xl font-bold text-blue-600">
                    {property.currency === 'USD' ? '$' : ''}{property.price.toLocaleString()}
                  </span>
                  {property.listing_type === 'rent' && <span className="text-sm">/month</span>}
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  📍 {property.district}, {property.city}
                </div>

                <div className="flex gap-4 text-sm text-gray-600 mb-2">
                  {property.bedrooms && <span>🛏️ {property.bedrooms}</span>}
                  {property.bathrooms && <span>🚿 {property.bathrooms}</span>}
                  {property.square_meters && <span>📐 {property.square_meters}m²</span>}
                </div>

                <div className="text-xs text-gray-500 capitalize">
                  {property.property_type} • {property.listing_type}
                  {property.is_featured && <span className="text-yellow-600"> ⭐ Featured</span>}
                </div>
                <button
    onClick={() => redirectHandler(property.id)}
    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
  >
    View Details
  </button>
              </div>

            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MainMapComp;
