// src/pages/RealEstate/MainRealEstate.tsx
// Fixed version with proper TypeScript types

import React, { useState } from "react";
// Replace lucide-react imports with react-icons
import {
  FaHome,
  FaBed,
  FaBath,
  FaCar,
  FaMapMarkerAlt,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaSearch,
  FaPhone,
  FaEnvelope,
  FaStar,
} from "react-icons/fa";

// Type definitions
interface RealEstateAgent {
  id: number;
  name: string;
  photo: string;
  phone: string;
  email: string;
  rating: number;
  properties_count: number;
}

interface Property {
  id: number;
  title: string;
  price: number;
  currency: string;
  listing_type: "sale" | "rent";
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number;
  location: string;
  images: string[];
  description: string;
  agent_id: number;
  posted_by: number;
  posted_date: string;
  features: string[];
  is_featured: boolean;
}

interface PropertyCardProps {
  property: Property;
}

const MainRealEstate: React.FC = () => {
  const [savedProperties, setSavedProperties] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  // Mock data - replace with your actual data fetching
  const realEstateAgents: RealEstateAgent[] = [
    {
      id: 1,
      name: "John Smith",
      photo: "/api/placeholder/150/150",
      phone: "+1-234-567-8900",
      email: "john@realestate.com",
      rating: 4.8,
      properties_count: 25,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      photo: "/api/placeholder/150/150",
      phone: "+1-234-567-8901",
      email: "sarah@realestate.com",
      rating: 4.9,
      properties_count: 32,
    },
  ];

  const properties: Property[] = [
    {
      id: 1,
      title: "Modern Family Home in Suburbia",
      price: 450000,
      currency: "USD",
      listing_type: "sale",
      property_type: "House",
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      area: 2500,
      location: "Suburbia, CA",
      images: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
      description: "Beautiful modern home with spacious rooms and garden.",
      agent_id: 1,
      posted_by: 1,
      posted_date: "2024-01-15",
      features: ["Garden", "Swimming Pool", "Modern Kitchen"],
      is_featured: true,
    },
    {
      id: 2,
      title: "Downtown Luxury Apartment",
      price: 2500,
      currency: "USD",
      listing_type: "rent",
      property_type: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      area: 1200,
      location: "Downtown, NY",
      images: ["/api/placeholder/400/300"],
      description: "Luxury apartment in the heart of downtown.",
      agent_id: 2,
      posted_by: 2,
      posted_date: "2024-02-01",
      features: ["City View", "Gym Access", "Concierge"],
      is_featured: false,
    },
  ];

  // Properly typed helper functions
  const getAgentById = (id: number): RealEstateAgent | undefined =>
    realEstateAgents.find((a) => a.id === id);

  const toggleSaveProperty = (propertyId: number): void => {
    setSavedProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const formatPrice = (
    price: number,
    currency: string,
    listingType: "sale" | "rent"
  ): string => {
    const formatted = new Intl.NumberFormat("en-US").format(price);
    const symbol = currency === "USD" ? "$" : currency;
    return listingType === "rent"
      ? `${symbol}${formatted}/month`
      : `${symbol}${formatted}`;
  };

  // Properly typed PropertyCard component
  const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    const agent = getAgentById(property.agent_id);
    const isSaved = savedProperties.includes(property.id);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Property Image */}
        <div className="relative">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          {property.is_featured && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
              Featured
            </span>
          )}
          <button
            onClick={() => toggleSaveProperty(property.id)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {isSaved ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-500" />
            )}
          </button>
          <span className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold capitalize">
            For {property.listing_type}
          </span>
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {property.title}
          </h3>

          <div className="flex items-center text-gray-600 mb-2">
            <FaMapMarkerAlt className="mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>

          <div className="text-2xl font-bold text-blue-600 mb-3">
            {formatPrice(
              property.price,
              property.currency,
              property.listing_type
            )}
          </div>

          {/* Property Features */}
          <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
            <div className="flex items-center">
              <FaBed className="mr-1" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center">
              <FaBath className="mr-1" />
              <span>{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center">
              <FaCar className="mr-1" />
              <span>{property.parking} parking</span>
            </div>
            <div className="flex items-center">
              <FaHome className="mr-1" />
              <span>{property.area} sq ft</span>
            </div>
          </div>

          {/* Agent Info */}
          {agent && (
            <div className="border-t pt-3">
              <div className="flex items-center">
                <img
                  src={agent.photo}
                  alt={agent.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {agent.name}
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 text-xs mr-1" />
                    <span className="text-xs text-gray-600">
                      {agent.rating} ({agent.properties_count} properties)
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <FaPhone size={12} />
                  </button>
                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <FaEnvelope size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Filter properties based on search and filters
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || property.listing_type === filterType;

    const matchesPrice =
      priceRange === "all" ||
      (() => {
        switch (priceRange) {
          case "under-100k":
            return property.price < 100000;
          case "100k-300k":
            return property.price >= 100000 && property.price <= 300000;
          case "300k-500k":
            return property.price >= 300000 && property.price <= 500000;
          case "over-500k":
            return property.price > 500000;
          case "under-2k":
            return property.listing_type === "rent" && property.price < 2000;
          case "2k-4k":
            return (
              property.listing_type === "rent" &&
              property.price >= 2000 &&
              property.price <= 4000
            );
          case "over-4k":
            return property.listing_type === "rent" && property.price > 4000;
          default:
            return true;
        }
      })();

    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Find Your Dream Property
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the perfect home or investment property with our
            comprehensive real estate listings.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            {/* Price Range Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Prices</option>
              {filterType === "rent" ? (
                <>
                  <option value="under-2k">Under $2,000</option>
                  <option value="2k-4k">$2,000 - $4,000</option>
                  <option value="over-4k">Over $4,000</option>
                </>
              ) : (
                <>
                  <option value="under-100k">Under $100K</option>
                  <option value="100k-300k">$100K - $300K</option>
                  <option value="300k-500k">$300K - $500K</option>
                  <option value="over-500k">Over $500K</option>
                </>
              )}
            </select>

            {/* Advanced Filters Button */}
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FaFilter className="mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProperties.length} of {properties.length}{" "}
            properties
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <FaHome className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        {/* Saved Properties Count */}
        {savedProperties.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
            <FaHeart className="inline mr-2" />
            {savedProperties.length} saved
          </div>
        )}
      </div>
    </div>
  );
};

export default MainRealEstate;
