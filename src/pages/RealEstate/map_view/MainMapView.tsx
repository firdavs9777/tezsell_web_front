import { useGetPropertiesQuery } from "@store/slices/realEstate";
import { Property } from "@store/type";
import { ChevronDownCircleIcon, MapPinPenIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";

interface MapProperty {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number | string;
  currency: string;
  listing_type: "sale" | "rent";
  property_type: string;
  is_featured?: boolean;
  district?: string;
  city?: string;
  region?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_meters?: number;
  main_image?: string | null;
}

interface Region {
  region: string;
}

interface District {
  id: number;
  district: string;
}

// Component to handle map view changes
const MapViewController = ({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
};

const MainMapComp = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useGetPropertiesQuery({
    page: 1,
    limit: 500,
  });

  const getPropertyWithCoordinates = (property: Property): Property => {
    if (property.latitude && property.longitude) {
      return {
        ...property,
        latitude:
          typeof property.latitude === "string"
            ? parseFloat(property.latitude)
            : property.latitude,
        longitude:
          typeof property.longitude === "string"
            ? parseFloat(property.longitude)
            : property.longitude,
      };
    }

    const districtCoordinates: Record<string, [number, number]> = {
      yunusabad: [41.3656, 69.2891],
      chilanzar: [41.2751, 69.2034],
      shaykhantaur: [41.3231, 69.2897],
      mirobod: [41.2865, 69.2734],
      almazar: [41.3479, 69.2348],
      bektemir: [41.2081, 69.337],
      sergeli: [41.2265, 69.2265],
      uchtepa: [41.2876, 69.1864],
      yashnaabad: [41.2632, 69.3201],
      olmazor: [41.3145, 69.2428],
    };

    const districtKey = property.district?.toLowerCase().replace(/\s+/g, "");
    const coords = districtCoordinates[districtKey || ""] || [41.2995, 69.2401];

    return {
      ...property,
      latitude: coords[0],
      longitude: coords[1],
    };
  };

  const convertToMapProperty = (property: Property): MapProperty => {
    const withCoords = getPropertyWithCoordinates(property);

    return {
      id: withCoords.id,
      title: withCoords.title,
      latitude: withCoords.latitude || 41.2995,
      longitude: withCoords.longitude || 69.2401,
      price:
        typeof withCoords.price === "string"
          ? parseFloat(withCoords.price)
          : withCoords.price,
      currency: withCoords.currency,
      listing_type: withCoords.listing_type,
      property_type: withCoords.property_type,
      is_featured: withCoords.is_featured,
      district: withCoords.district,
      city: withCoords.city,
      region: withCoords.region,
      bedrooms: withCoords.bedrooms,
      bathrooms: withCoords.bathrooms,
      square_meters: withCoords.square_meters,
      main_image: withCoords.main_image,
    };
  };

  const allProperties: MapProperty[] = propertiesResponse?.results
    ? propertiesResponse.results.map(convertToMapProperty)
    : [];

  // Map center and zoom state
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    41.2995, 69.2401,
  ]);
  const [mapZoom, setMapZoom] = useState<number>(12);

  // Other property filters (outside the map)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [propertyType, setPropertyType] = useState<string>("");
  const [listingType, setListingType] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");

  // FIXED: Move regionCoordinates outside of component or memoize it
  const regionCoordinates = useMemo(
    () => ({
      "Toshkent shahri": {
        center: [41.2995, 69.2401] as [number, number],
        zoom: 11,
      },
      Tashkent: { center: [41.2995, 69.2401] as [number, number], zoom: 11 },
      "Andijon viloyati": {
        center: [40.7821, 72.3442] as [number, number],
        zoom: 10,
      },
      "Buxoro viloyati": {
        center: [39.7747, 64.4286] as [number, number],
        zoom: 10,
      },
      "Farg'ona viloyati": {
        center: [40.3897, 71.7864] as [number, number],
        zoom: 10,
      },
      "Jizzax viloyati": {
        center: [40.1156, 67.8422] as [number, number],
        zoom: 10,
      },
      "Xorazm viloyati": {
        center: [41.3775, 60.3711] as [number, number],
        zoom: 10,
      },
      "Namangan viloyati": {
        center: [40.9983, 71.6726] as [number, number],
        zoom: 10,
      },
      "Navoiy viloyati": {
        center: [40.0844, 65.3792] as [number, number],
        zoom: 10,
      },
      "Qashqadaryo viloyati": {
        center: [38.8597, 65.7975] as [number, number],
        zoom: 10,
      },
      "Qoraqalpog'iston Respublikasi": {
        center: [43.8041, 59.4469] as [number, number],
        zoom: 9,
      },
      "Samarqand viloyati": {
        center: [39.627, 66.975] as [number, number],
        zoom: 10,
      },
      "Sirdaryo viloyati": {
        center: [40.8375, 68.6658] as [number, number],
        zoom: 10,
      },
      "Surxondaryo viloyati": {
        center: [37.9414, 67.5514] as [number, number],
        zoom: 10,
      },
      "Toshkent viloyati": {
        center: [41.0775, 69.7178] as [number, number],
        zoom: 10,
      },
    }),
    []
  );

  const tileProviders = useMemo(
    () => ({
      openStreetMap: {
        name: "Street Map",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "© OpenStreetMap contributors",
      },
      satellite: {
        name: "Satellite",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "© Esri",
      },
    }),
    []
  );

  // Fetch regions from API on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(
          "https://api.webtezsell.com/accounts/regions/"
        );
        const data = await response.json();
        if (data.success) {
          setRegions(data.regions);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegions();
  }, []);

  // FIXED: Fetch districts when region is selected - removed regionCoordinates dependency
  useEffect(() => {
    if (selectedRegion) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        setDistricts([]);
        setSelectedDistrict("");

        try {
          const response = await fetch(
            `https://api.webtezsell.com/accounts/districts/${selectedRegion}/`
          );
          const data = await response.json();
          if (data.success) {
            setDistricts(data.districts);
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
        } finally {
          setLoadingDistricts(false);
        }
      };

      fetchDistricts();

      // Update map center when region is selected
      const regionCoords =
        regionCoordinates[selectedRegion as keyof typeof regionCoordinates];

      if (regionCoords) {
        setMapCenter(regionCoords.center);
        setMapZoom(regionCoords.zoom);
      }
    } else {
      setDistricts([]);
      setSelectedDistrict("");
      // Reset to default view when no region is selected
      setMapCenter([41.2995, 69.2401]);
      setMapZoom(12);
    }
  }, [selectedRegion, regionCoordinates]); // Now regionCoordinates is memoized

  // Update map center when district is selected
  const filteredProperties = useMemo(() => {
    let filtered = allProperties;

    // Location filters
    if (selectedRegion) {
      filtered = filtered.filter(
        (property) =>
          property.region === selectedRegion ||
          property.city === selectedRegion ||
          (selectedRegion === "Toshkent shahri" &&
            (property.city === "Tashkent" || property.city === "Toshkent"))
      );
    }

    if (selectedDistrict) {
      filtered = filtered.filter(
        (property) =>
          property.district === selectedDistrict ||
          property.district?.includes(selectedDistrict)
      );
    }

    // Property type filter
    if (propertyType) {
      filtered = filtered.filter(
        (property) => property.property_type === propertyType
      );
    }

    // Listing type filter
    if (listingType) {
      filtered = filtered.filter(
        (property) => property.listing_type === listingType
      );
    }

    // Bedrooms filter
    if (bedrooms) {
      filtered = filtered.filter(
        (property) => property.bedrooms?.toString() === bedrooms
      );
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(
        (property) => Number(property.price) >= parseInt(priceRange.min)
      );
    }
    if (priceRange.max) {
      filtered = filtered.filter(
        (property) => Number(property.price) <= parseInt(priceRange.max)
      );
    }

    return filtered;
  }, [
    allProperties,
    selectedRegion,
    selectedDistrict,
    propertyType,
    listingType,
    bedrooms,
    priceRange,
  ]);

  useEffect(() => {
    if (selectedDistrict && filteredProperties.length > 0) {
      // Find properties in the selected district to center the map
      const districtProperties = filteredProperties.filter(
        (property) =>
          property.district === selectedDistrict ||
          property.district?.includes(selectedDistrict)
      );

      if (districtProperties.length > 0) {
        // Calculate center point of district properties
        const avgLat =
          districtProperties.reduce((sum, prop) => sum + prop.latitude, 0) /
          districtProperties.length;
        const avgLng =
          districtProperties.reduce((sum, prop) => sum + prop.longitude, 0) /
          districtProperties.length;

        setMapCenter([avgLat, avgLng]);
        setMapZoom(13); // Zoom in more for district view
      }
    }
  }, [selectedDistrict, filteredProperties]);

  const navigate = useNavigate();
  const redirectHandler = (id: string) => navigate(`/properties/${id}`);

  const [mapStyle, setMapStyle] = useState<"openStreetMap" | "satellite">(
    "openStreetMap"
  );

  const clearAllFilters = () => {
    setSelectedRegion("");
    setSelectedDistrict("");
    setPropertyType("");
    setListingType("");
    setBedrooms("");
    setPriceRange({ min: "", max: "" });
  };

  const getLocationDisplayText = () => {
    if (selectedDistrict && selectedRegion) {
      return `${selectedDistrict}, ${selectedRegion}`;
    }
    if (selectedRegion) {
      return selectedRegion;
    }
    return "All Regions";
  };

  // Function to fit map bounds to show all filtered properties
  const fitMapToProperties = () => {
    if (filteredProperties.length === 0) return;

    const lats = filteredProperties.map((p) => p.latitude);
    const lngs = filteredProperties.map((p) => p.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate center and appropriate zoom
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    setMapCenter([centerLat, centerLng]);

    // Calculate zoom based on bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 12;
    if (maxDiff > 2) zoom = 8;
    else if (maxDiff > 1) zoom = 9;
    else if (maxDiff > 0.5) zoom = 10;
    else if (maxDiff > 0.1) zoom = 12;
    else zoom = 14;

    setMapZoom(zoom);
  };

  if (isLoading || loadingRegions) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
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
      <h1 className="text-2xl font-bold mb-6">Property Map</h1>

      {/* External Property Filters */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Property Filters</h2>
          <div className="flex gap-2">
            <button
              onClick={fitMapToProperties}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
              disabled={filteredProperties.length === 0}
            >
              Fit to Results
            </button>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Type
            </label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price
            </label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              placeholder="No limit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results counter */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProperties.length} of {allProperties.length}{" "}
          properties
        </div>
      </div>

      {/* Map container with relative positioning for overlay */}
      <div className="relative">
        {/* Map Style Toggle */}
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md">
          <button
            onClick={() => setMapStyle("openStreetMap")}
            className={`px-3 py-2 text-sm rounded-l-lg ${
              mapStyle === "openStreetMap"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-3 py-2 text-sm rounded-r-lg ${
              mapStyle === "satellite"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Location Selector Overlay */}
        <div className="absolute top-4 left-4 z-[1000]">
          <button
            onClick={() => setShowLocationPopup(!showLocationPopup)}
            className="flex items-center space-x-2 bg-white rounded-full shadow-lg px-4 py-3 hover:shadow-xl transition-all duration-200"
          >
            <MapPinPenIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              {getLocationDisplayText()}
            </span>
            <ChevronDownCircleIcon
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                showLocationPopup ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Location Popup */}
          {showLocationPopup && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[300px] z-[1001]">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Select Location
                  </h3>
                  <button
                    onClick={() => setShowLocationPopup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaXmark className="h-5 w-5" />
                  </button>
                </div>

                {/* Region Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingRegions}
                  >
                    <option value="">All Regions</option>
                    {regions.map((region) => (
                      <option key={region.region} value={region.region}>
                        {region.region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedRegion || loadingDistricts}
                  >
                    <option value="">All Districts</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.district}>
                        {district.district}
                      </option>
                    ))}
                  </select>
                  {loadingDistricts && (
                    <div className="mt-1 text-xs text-gray-500">
                      Loading districts...
                    </div>
                  )}
                </div>

                {/* Apply/Clear buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedRegion("");
                      setSelectedDistrict("");
                    }}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    disabled={!selectedRegion && !selectedDistrict}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowLocationPopup(false)}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          minZoom={5}
          maxZoom={18}
          style={{ height: "600px", width: "100%" }}
          className="rounded-lg"
          zoomControl={true}
          closePopupOnClick={true}
        >
          <MapViewController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url={
              tileProviders[mapStyle]?.url || tileProviders.openStreetMap.url
            }
            attribution={
              tileProviders[mapStyle]?.attribution ||
              tileProviders.openStreetMap.attribution
            }
            key={mapStyle}
          />
          {filteredProperties.map((property) => (
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
                      {property.currency === "USD" ? "$" : ""}
                      {property.price.toLocaleString()}
                    </span>
                    {property.listing_type === "rent" && (
                      <span className="text-sm">/month</span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {property.district}, {property.city}
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600 mb-2">
                    {property.bedrooms && <span>{property.bedrooms} bed</span>}
                    {property.bathrooms && (
                      <span>{property.bathrooms} bath</span>
                    )}
                    {property.square_meters && (
                      <span>{property.square_meters}m²</span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 capitalize mb-3">
                    {property.property_type} • {property.listing_type}
                    {property.is_featured && (
                      <span className="text-yellow-600"> ⭐ Featured</span>
                    )}
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
    </div>
  );
};

export default MainMapComp;
