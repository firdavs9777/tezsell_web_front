import React, { useState } from "react";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Heart,
  Eye,
  Star,
  Filter,
} from "lucide-react";

// Mockup Data
const users = [
  {
    id: 1,
    username: "john_doe",
    email: "john@example.com",
    first_name: "John",
    last_name: "Doe",
    phone: "+998901234567",
  },
  {
    id: 2,
    username: "sarah_agent",
    email: "sarah@realestate.uz",
    first_name: "Sarah",
    last_name: "Williams",
    phone: "+998905678901",
  },
  {
    id: 3,
    username: "mike_seller",
    email: "mike@gmail.com",
    first_name: "Mike",
    last_name: "Johnson",
    phone: "+998907891234",
  },
];

const realEstateAgents = [
  {
    id: 1,
    user: 2,
    agency_name: "Premium Properties Uzbekistan",
    licence_number: "REA-2024-001",
    is_verified: true,
    rating: 4.85,
    total_sales: 127,
    years_experience: 8,
    specialization: "Luxury Residential",
  },
  {
    id: 2,
    user: 3,
    agency_name: "City Homes Realty",
    licence_number: "REA-2024-002",
    is_verified: true,
    rating: 4.32,
    total_sales: 89,
    years_experience: 5,
    specialization: "Commercial Properties",
  },
];

const properties = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "Luxury 3-Bedroom Apartment in Chilanzar",
    description:
      "Beautiful modern apartment with stunning city views. Fully renovated with high-end finishes, spacious living areas, and premium appliances.",
    property_type: "apartment",
    listing_type: "sale",
    owner: 1,
    agent: 1,
    address: "15 Amir Temur Avenue, Building 7, Apt 45",
    district: "Chilanzar",
    city: "Tashkent",
    bedrooms: 3,
    bathrooms: 2,
    square_meters: 120,
    floor: 8,
    total_floors: 12,
    year_built: 2019,
    parking_spaces: 1,
    price: 180000.0,
    currency: "USD",
    has_balcony: true,
    has_pool: true,
    has_elevator: true,
    is_furnished: true,
    metro_distance: 800,
    school_distance: 300,
    is_featured: true,
    views_count: 342,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
  },
  {
    id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    title: "Modern Townhouse with Garden",
    description:
      "Spacious 4-bedroom townhouse in a quiet residential area. Features include a private garden, garage, and modern kitchen.",
    property_type: "townhouse",
    listing_type: "rent",
    owner: 2,
    agent: 2,
    address: "23 Mustaqillik Street, Yunusabad District",
    district: "Yunusabad",
    city: "Tashkent",
    bedrooms: 4,
    bathrooms: 3,
    square_meters: 180,
    total_floors: 2,
    year_built: 2021,
    parking_spaces: 2,
    price: 2500.0,
    currency: "USD",
    has_balcony: true,
    has_garage: true,
    has_garden: true,
    is_furnished: false,
    metro_distance: 1500,
    school_distance: 600,
    is_featured: false,
    views_count: 156,
    image:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400&h=300&fit=crop",
  },
  {
    id: "c3d4e5f6-g7h8-9012-cdef-345678901234",
    title: "Commercial Office Space in City Center",
    description:
      "Prime commercial office space in the heart of Tashkent. Ideal for businesses, startups, or corporate headquarters.",
    property_type: "office",
    listing_type: "rent",
    owner: 3,
    agent: 1,
    address: "5 Islam Karimov Street, Mirabad District",
    district: "Mirabad",
    city: "Tashkent",
    bathrooms: 4,
    square_meters: 250,
    floor: 5,
    total_floors: 15,
    year_built: 2020,
    parking_spaces: 8,
    price: 4000.0,
    currency: "USD",
    has_elevator: true,
    is_furnished: true,
    metro_distance: 200,
    hospital_distance: 800,
    is_featured: true,
    views_count: 89,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
  },
  {
    id: "d4e5f6g7-h8i9-0123-defg-456789012345",
    title: "Cozy 2-Bedroom Apartment",
    description:
      "Affordable and comfortable 2-bedroom apartment perfect for young professionals or small families.",
    property_type: "apartment",
    listing_type: "sale",
    owner: 1,
    agent: null,
    address: "42 Navoi Street, Chilanzar District",
    district: "Chilanzar",
    city: "Tashkent",
    bedrooms: 2,
    bathrooms: 1,
    square_meters: 75,
    floor: 4,
    total_floors: 9,
    year_built: 2015,
    parking_spaces: 0,
    price: 95000.0,
    currency: "USD",
    has_balcony: true,
    has_elevator: true,
    is_furnished: false,
    metro_distance: 1200,
    school_distance: 400,
    is_featured: false,
    views_count: 234,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
  },
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "townhouse", label: "Townhouse" },
  { value: "office", label: "Office" },
  { value: "commercial", label: "Commercial" },
];

const LISTING_TYPES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

const MainRealEstate = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedListing, setSelectedListing] = useState("");
  const [savedProperties, setSavedProperties] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const getAgentById = (id) => realEstateAgents.find((a) => a.id === id);
  const getUserById = (id) => users.find((u) => u.id === id);

  const toggleSaveProperty = (propertyId) => {
    setSavedProperties((prev) => {
      const newSaved = new Set(prev);
      if (newSaved.has(propertyId)) {
        newSaved.delete(propertyId);
      } else {
        newSaved.add(propertyId);
      }
      return newSaved;
    });
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      !selectedType || property.property_type === selectedType;
    const matchesListing =
      !selectedListing || property.listing_type === selectedListing;

    return matchesSearch && matchesType && matchesListing;
  });

  const formatPrice = (price, currency, listingType) => {
    const formattedPrice = new Intl.NumberFormat("en-US").format(price);
    const suffix = listingType === "rent" ? "/month" : "";
    return `${formattedPrice} ${currency}${suffix}`;
  };

  const PropertyCard = ({ property }) => {
    const agent = property.agent ? getAgentById(property.agent) : null;
    const agentUser = agent ? getUserById(agent.user) : null;
    const isSaved = savedProperties.has(property.id);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                property.listing_type === "sale"
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
            >
              {property.listing_type === "sale" ? "For Sale" : "For Rent"}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            {property.is_featured && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                Featured
              </span>
            )}
            <button
              onClick={() => toggleSaveProperty(property.id)}
              className={`p-1 rounded-full ${
                isSaved ? "bg-red-500 text-white" : "bg-white text-gray-600"
              } hover:bg-red-500 hover:text-white transition-colors`}
            >
              <Heart size={16} fill={isSaved ? "white" : "none"} />
            </button>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            <Eye size={12} />
            {property.views_count}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin size={14} className="mr-1" />
            <span className="text-sm">
              {property.district}, {property.city}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {property.description}
          </p>

          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed size={14} />
                <span>{property.bedrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Bath size={14} />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square size={14} />
              <span>{property.square_meters}m²</span>
            </div>
            {property.parking_spaces > 0 && (
              <div className="flex items-center gap-1">
                <Car size={14} />
                <span>{property.parking_spaces}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(
                property.price,
                property.currency,
                property.listing_type
              )}
            </span>
            {property.listing_type === "sale" && (
              <span className="text-sm text-gray-500">
                {Math.round(property.price / property.square_meters)}{" "}
                {property.currency}/m²
              </span>
            )}
          </div>

          {agent && agentUser && (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {agentUser.first_name} {agentUser.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{agent.agency_name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <span className="text-sm">{agent.rating}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm">
              View Details
            </button>
            <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition-colors text-sm">
              Contact Agent
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Real Estate Properties
          </h1>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sale & Rent</option>
                {LISTING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {filteredProperties.length} Properties Found
          </h2>
          <div className="text-sm text-gray-600">
            {savedProperties.size} properties saved
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainRealEstate;
