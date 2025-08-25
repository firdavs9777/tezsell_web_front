import { divIcon, Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Home, MapPin, Maximize2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// Mock config types and data since the config file might be missing
const defaultMapConfig = {
  center: [41.2995, 69.2401] as [number, number],
  zoom: 11,
  minZoom: 3,
  maxZoom: 18,
};

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

const propertyMarkerConfig = {
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

const uzbekistanCities = {
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
  }
};

// Fix for default markers in React-Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Use a more generic interface that works with both Property types
interface MapProperty {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  currency: string;
  listing_type: 'sale' | 'rent';
  property_type: string;
  is_featured?: boolean;
  district?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_meters?: number;
  main_image?: string;
}

interface PropertyMapProps {
  properties: MapProperty[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showControls?: boolean;
  onPropertyClick?: (property: MapProperty) => void;
  onMapBoundsChange?: (bounds: LatLngBounds) => void;
  className?: string;
  hidePropertyCount?: boolean;
  hideLegend?: boolean;
}

// Custom hook to handle map events
const MapEvents: React.FC<{
  onBoundsChange?: (bounds: LatLngBounds) => void;
  jumpToCity?: string;
  onJumpComplete?: () => void;
}> = ({
  onBoundsChange,
  jumpToCity,
  onJumpComplete
}) => {
  const map = useMap();

  useEffect(() => {
    if (onBoundsChange) {
      const handleMoveEnd = () => {
        onBoundsChange(map.getBounds());
      };

      map.on('moveend', handleMoveEnd);
      map.on('zoomend', handleMoveEnd);

      return () => {
        map.off('moveend', handleMoveEnd);
        map.off('zoomend', handleMoveEnd);
      };
    }
  }, [map, onBoundsChange]);

  // Handle city jumping
  useEffect(() => {
    if (jumpToCity && uzbekistanCities[jumpToCity as keyof typeof uzbekistanCities]) {
      const city = uzbekistanCities[jumpToCity as keyof typeof uzbekistanCities];
      map.setView([city.lat, city.lng], city.zoom || 12, {
        animate: true,
        duration: 1.5
      });
      onJumpComplete?.();
    }
  }, [map, jumpToCity, onJumpComplete]);

  return null;
};

// Property popup component
const PropertyPopup: React.FC<{ property: MapProperty; onPropertyClick?: (property: MapProperty) => void }> = ({
  property,
  onPropertyClick
}) => {


  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === "USD" ? "$" : currency === "UZS" ? "so'm" : currency;
    return `${symbol}${new Intl.NumberFormat().format(price)}`;
  };

  return (
    <div className="min-w-[250px] max-w-[300px]">
      {property.main_image && (
        <img
          src={property.main_image}
          alt={property.title}
          className="w-full h-32 object-cover rounded-t-lg mb-2"
        />
      )}

      <div className="p-2">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
          {property.title}
        </h3>

        <div className="text-lg font-bold text-blue-600 mb-2">
          {formatPrice(property.price, property.currency)}
          {property.listing_type === 'rent' && (
            <span className="text-sm">/month</span>
          )}
        </div>

        <div className="flex items-center text-xs text-gray-600 mb-2">
          <MapPin size={12} className="mr-1" />
          <span>{property.district}, {property.city}</span>
        </div>

        {(property.bedrooms || property.bathrooms || property.square_meters) && (
          <div className="flex justify-between text-xs text-gray-600 mb-3">
            {property.bedrooms && (
              <span>{property.bedrooms} bed</span>
            )}
            {property.bathrooms && (
              <span>{property.bathrooms} bath</span>
            )}
            {property.square_meters && (
              <span>{property.square_meters}m²</span>
            )}
          </div>
        )}

        <button
          onClick={() => onPropertyClick?.(property)}
          className="w-full bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Custom property marker
const createPropertyIcon = (property: MapProperty) => {
  const config = property.is_featured
    ? propertyMarkerConfig.featured
    : propertyMarkerConfig[property.listing_type];

  const iconHtml = `
    <div style="
      background-color: ${config.fillColor};
      border: 2px solid ${config.color};
      border-radius: 50%;
      width: ${config.radius * 2}px;
      height: ${config.radius * 2}px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      <div style="color: white; font-size: 10px; font-weight: bold;">
        ${property.listing_type === 'sale' ? '$' : '₽'}
      </div>
    </div>
  `;

  return divIcon({
    html: iconHtml,
    className: 'custom-property-marker',
    iconSize: [config.radius * 2, config.radius * 2],
    iconAnchor: [config.radius, config.radius]
  });
};

const PropertyMap: React.FC<PropertyMapProps> = React.memo(({
  properties = [],
  center = defaultMapConfig.center,
  zoom = defaultMapConfig.zoom,
  height = '500px',
  showControls = true,
  onPropertyClick,
  onMapBoundsChange,
  className = '',
  hidePropertyCount = false,
  hideLegend = false
}) => {
  const [mapStyle, setMapStyle] = useState('openStreetMap');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [jumpToCity, setJumpToCity] = useState<string>('');

  // Ensure component is mounted before rendering map to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCityJump = (cityKey: string) => {
    if (cityKey && uzbekistanCities[cityKey as keyof typeof uzbekistanCities]) {
      setJumpToCity(cityKey);
    }
  };

  const handleJumpComplete = () => {
    setJumpToCity('');
  };

  const toggleFullscreen = () => {
    if (mapRef.current) {
      if (!document.fullscreenElement) {
        mapRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Don't render map until component is fully mounted (prevents hydration issues)
  if (!isMounted) {
    return (
      <div
        className={`relative ${className} flex items-center justify-center bg-gray-100`}
        style={{ height: isFullscreen ? '100vh' : height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`relative ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          {/* Style Selector */}
          <div className="bg-white rounded-lg shadow-md p-2">
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="text-sm border-none outline-none bg-transparent"
            >
              {Object.entries(tileProviders).map(([key, provider]) => (
                <option key={key} value={key}>{provider.name}</option>
              ))}
            </select>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>

          {/* City Quick Jump */}
          <div className="bg-white rounded-lg shadow-md p-2">
            <select
              onChange={(e) => handleCityJump(e.target.value)}
              className="text-sm border-none outline-none bg-transparent"
              defaultValue=""
            >
              <option value="">Quick Jump</option>
              {Object.entries(uzbekistanCities).map(([key, city]) => (
                <option key={key} value={key}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Property Count Display - Only show if not hidden */}
      {properties.length > 0 && !hidePropertyCount && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-2">
          <div className="flex items-center space-x-2 text-sm">
            <Home size={16} className="text-blue-600" />
            <span className="font-medium">{properties.length} Properties Found</span>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={defaultMapConfig.minZoom}
        maxZoom={defaultMapConfig.maxZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        zoomControl={true}
        closePopupOnClick={true}
      >
        <TileLayer
          url={tileProviders[mapStyle as keyof typeof tileProviders]?.url || tileProviders.openStreetMap.url}
          key={mapStyle}
        />

        <MapEvents
          onBoundsChange={onMapBoundsChange}
          jumpToCity={jumpToCity}
          onJumpComplete={handleJumpComplete}
        />

        {properties.map((property) => (
          <Marker
            key={`marker-${property.id}`}
            position={[property.latitude, property.longitude]}
            icon={createPropertyIcon(property)}
          >
            <Popup
              closeButton={true}
              className="custom-popup"
              maxWidth={320}
              minWidth={250}
            >
              <PropertyPopup
                property={property}
                onPropertyClick={onPropertyClick}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend - Only show if not hidden */}
      {properties.length > 0 && !hideLegend && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md p-3">
          <h4 className="font-medium text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: propertyMarkerConfig.sale.fillColor }}
              />
              <span>For Sale</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: propertyMarkerConfig.rent.fillColor }}
              />
              <span>For Rent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: propertyMarkerConfig.featured.fillColor }}
              />
              <span>Featured</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.properties.length === nextProps.properties.length &&
    prevProps.properties.every((prop, index) => prop.id === nextProps.properties[index]?.id) &&
    prevProps.center?.[0] === nextProps.center?.[0] &&
    prevProps.center?.[1] === nextProps.center?.[1] &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.height === nextProps.height &&
    prevProps.showControls === nextProps.showControls &&
    prevProps.className === nextProps.className &&
    prevProps.hidePropertyCount === nextProps.hidePropertyCount &&
    prevProps.hideLegend === nextProps.hideLegend
  );
});

PropertyMap.displayName = 'PropertyMap';

export default PropertyMap;
