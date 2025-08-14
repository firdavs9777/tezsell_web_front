import { divIcon, Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Home, MapPin, Maximize2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import {
  defaultMapConfig,
  propertyMarkerConfig,
  tileProviders,
  uzbekistanCities
} from './config/mapConfig';

// Fix for default markers in React-Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Property {
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
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showControls?: boolean;
  onPropertyClick?: (property: Property) => void;
  onMapBoundsChange?: (bounds: LatLngBounds) => void;
  className?: string;
  hidePropertyCount?: boolean; // Add this prop to hide property count
  hideLegend?: boolean; // Add this prop to hide legend
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
const PropertyPopup: React.FC<{ property: Property; onPropertyClick?: (property: Property) => void }> = ({
  property,
  onPropertyClick
}) => {
  const { t } = useTranslation();

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
            <span className="text-sm">{t('pricing.month')}</span>
          )}
        </div>

        <div className="flex items-center text-xs text-gray-600 mb-2">
          <MapPin size={12} className="mr-1" />
          <span>{property.district}, {property.city}</span>
        </div>

        {(property.bedrooms || property.bathrooms || property.square_meters) && (
          <div className="flex justify-between text-xs text-gray-600 mb-3">
            {property.bedrooms && (
              <span>{property.bedrooms} {t('propertyCard.bed')}</span>
            )}
            {property.bathrooms && (
              <span>{property.bathrooms} {t('propertyCard.bath')}</span>
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
          {t('propertyCard.viewDetails')}
        </button>
      </div>
    </div>
  );
};

// Custom property marker
const createPropertyIcon = (property: Property) => {
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
  hidePropertyCount = false, // Add this prop with default value
  hideLegend = false // Add this prop with default value
}) => {
  const { t } = useTranslation();
  const [mapStyle, setMapStyle] = useState<keyof typeof tileProviders>('openStreetMap');
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
              {Object.entries(tileProviders).map(([key, provider]: [string, any]) => (
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
              {Object.entries(uzbekistanCities).map(([key, city]: [string, any]) => (
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
            <span className="font-medium">{properties.length} {t('results.propertiesFound')}</span>
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
          key={mapStyle} // Only re-render TileLayer when style changes
        />

        <MapEvents
          onBoundsChange={onMapBoundsChange}
          jumpToCity={jumpToCity}
          onJumpComplete={handleJumpComplete}
        />

        {properties.map((property) => (
          <Marker
            key={`marker-${property.id}`} // More specific key
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
              <span>{t('filterOptions.forSale')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: propertyMarkerConfig.rent.fillColor }}
              />
              <span>{t('filterOptions.forRent')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: propertyMarkerConfig.featured.fillColor }}
              />
              <span>{t('propertyCard.featured')}</span>
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
    prevProps.hidePropertyCount === nextProps.hidePropertyCount && // Add this to comparison
    prevProps.hideLegend === nextProps.hideLegend // Add this to comparison
  );
});

PropertyMap.displayName = 'PropertyMap';

export default PropertyMap;
