import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBath,
  FaBed,
  FaCar,
  FaCopy,
  FaEnvelope,
  FaEye,
  FaHeart,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaStar,
  FaSpinner,
  FaCalendarAlt,
  FaTrash,
} from "react-icons/fa";

import { RootState } from "@store/index";
import {
  useGetSavedPropertiesQuery,
  useToggleUnsavePropertyMutation,
} from "@store/slices/realEstate";

// Type definitions based on your existing code
interface User {
  id: number;
  username: string;
  phone_number: string;
  user_type: string;
}

interface Property {
  id: string;
  title: string;
  price: string | number;
  currency: string;
  listing_type: "sale" | "rent";
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces: number;
  square_meters: number;
  district: string;
  city: string;
  views_count: number;
  is_featured: boolean;
  main_image?: string | null;
  has_balcony?: boolean;
  has_garage?: boolean;
  has_garden?: boolean;
  has_pool?: boolean;
  has_elevator?: boolean;
  is_furnished?: boolean;
  property_type_display?: string;
  listing_type_display?: string;
  owner?: User;
  agent?: {
    id: number;
    user: User;
    agency_name: string;
    licence_number: string;
    is_verified: boolean;
    rating: string | number;
    total_sales: number;
    years_experience: number;
    specialization: string;
    created_at: string;
  };
}

interface SavedProperty {
  id: number;
  property: Property;
  saved_at: string;
}



const SavedProperties: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Get user info from Redux store
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || '';

  // Fetch saved properties
  const {
    data: savedPropertiesData,
    isLoading,
    error,
    refetch
  } = useGetSavedPropertiesQuery({ token });

  const [toggleUnsaveProperty, { isLoading: isUnsaving }] = useToggleUnsavePropertyMutation();

  // Handle unsaving a property
  const handleUnsaveProperty = async (propertyId: string): Promise<void> => {
    try {
      await toggleUnsaveProperty({ propertyId, token }).unwrap();
      refetch(); // Refresh the saved properties list
      toast.success(t('success.propertyUnsaved') || 'Property removed from saved list');
    } catch (error) {
      console.error('Failed to unsave property:', error);
      toast.error(t('errors.unsaveFailed') || 'Failed to remove property from saved list');
    }
  };

  // Contact modal handlers
  const handleContactClick = (property: Property): void => {
    setSelectedProperty(property);
    setShowPhoneModal(true);
  };

  const handlePhoneCall = (phoneNumber: string): void => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleCopyPhone = async (phoneNumber: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      toast.success(t('success.phoneCopied') || 'Phone number copied!');
    } catch (err) {
      console.error('Failed to copy phone number:', err);
      toast.error(t('errors.copyFailed') || 'Failed to copy phone number');
    }
  };

  // Helper functions
  const formatPrice = (
    price: string | number,
    currency: string,
    listingType: "sale" | "rent"
  ): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    const formatted = new Intl.NumberFormat("en-US").format(numPrice);
    const symbol = currency === "USD" ? "$" : currency === "UZS" ? "so'm" : currency;
    return listingType === "rent"
      ? `${symbol}${formatted}${t('pricing.month') || '/month'}`
      : `${symbol}${formatted}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPropertyFeatures = (property: Property): string[] => {
    const features: string[] = [];
    if (property.has_balcony) features.push(t('propertyCard.balcony') || 'Balcony');
    if (property.has_garage) features.push(t('propertyCard.garage') || 'Garage');
    if (property.has_garden) features.push(t('propertyCard.garden') || 'Garden');
    if (property.has_pool) features.push(t('propertyCard.pool') || 'Pool');
    if (property.has_elevator) features.push(t('propertyCard.elevator') || 'Elevator');
    if (property.is_furnished) features.push(t('propertyCard.furnished') || 'Furnished');
    return features;
  };

  const formatAgentRating = (rating: string | number): string => {
    if (typeof rating === "string") {
      return parseFloat(rating).toFixed(1);
    }
    return (rating || 0).toFixed(1);
  };

  // Get saved properties from the response
  const savedProperties = savedPropertiesData?.results || [];
  const totalSaved = savedPropertiesData?.count || 0;

  // If user is not authenticated
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('auth.loginRequired') || 'Please log in to view saved properties'}
          </h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('auth.login') || 'Log In'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('savedProperties.title') || 'Saved Properties'}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('savedProperties.subtitle') || 'Your favorite properties in one place'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <div>
            {isLoading ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span>{t('results.loading') || 'Loading saved properties...'}</span>
              </div>
            ) : (
              <h2 className="text-xl font-semibold">
                {totalSaved} {t('results.savedPropertiesFound') || 'saved properties'}
              </h2>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            <p>{t('errors.failedToLoadSaved') || 'Failed to load saved properties'}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : savedProperties.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaHeart size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('savedProperties.noSavedProperties') || 'No saved properties yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('savedProperties.startSaving') || 'Start exploring and save properties you like'}
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('savedProperties.browseProperties') || 'Browse Properties'}
            </button>
          </div>
        ) : (
          // Properties Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((savedItem: SavedProperty) => {
              const property = savedItem.property;
              const defaultImage = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop`;

              return (
                <div
                  key={savedItem.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Property Image */}
                  <div
                    className="relative cursor-pointer"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <img
                      src={property.main_image || defaultImage}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    {property.is_featured && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
                        {t('propertyCard.featured') || 'Featured'}
                      </span>
                    )}

                    {/* Unsave Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsaveProperty(property.id);
                      }}
                      disabled={isUnsaving}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                      title={t('propertyCard.unsave') || 'Remove from saved'}
                    >
                      {isUnsaving ? (
                        <FaSpinner className="text-gray-500 animate-spin" />
                      ) : (
                        <FaHeart className="text-red-500" />
                      )}
                    </button>

                    <span className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold capitalize">
                      {property.listing_type_display ||
                        (property.listing_type === 'sale'
                          ? t('filterOptions.forSale') || 'For Sale'
                          : t('filterOptions.forRent') || 'For Rent')}
                    </span>

                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                      <FaEye className="mr-1" size={12} />
                      {property.views_count}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {property.title}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-2">
                      <FaMapMarkerAlt className="mr-1" />
                      <span className="text-sm">
                        {property.district}, {property.city}
                      </span>
                    </div>

                    <div className="text-2xl font-bold text-blue-600 mb-3">
                      {formatPrice(property.price, property.currency, property.listing_type)}
                    </div>

                    {/* Property Features */}
                    <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                      {property.bedrooms && (
                        <div className="flex items-center">
                          <FaBed className="mr-1" />
                          <span>{property.bedrooms} {t('propertyCard.bed') || 'bed'}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center">
                          <FaBath className="mr-1" />
                          <span>{property.bathrooms} {t('propertyCard.bath') || 'bath'}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <FaCar className="mr-1" />
                        <span>{property.parking_spaces} {t('propertyCard.parking') || 'parking'}</span>
                      </div>
                      <div className="flex items-center">
                        <FaHome className="mr-1" />
                        <span>{property.square_meters} m²</span>
                      </div>
                    </div>

                    {/* Saved Date */}
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <FaCalendarAlt className="mr-1" />
                      <span>
                        {t('savedProperties.savedOn') || 'Saved on'} {formatDate(savedItem.saved_at)}
                      </span>
                    </div>

                    {/* Property Type and Features */}
                    <div className="mb-3">
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium mb-1 capitalize">
                        {property.property_type_display ||
                          t(`filterOptions.${property.property_type}`) ||
                          property.property_type.replace("_", " ")}
                      </span>
                      {getPropertyFeatures(property)
                        .slice(0, 2)
                        .map((feature, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium ml-1 mb-1"
                          >
                            {feature}
                          </span>
                        ))}
                    </div>

                    {/* Agent Info */}
                    {property.agent && (
                      <div className="border-t pt-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">
                            {property.agent.agency_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {property.agent.agency_name}
                            </div>
                            <div className="flex items-center">
                              <FaStar className="text-yellow-400 text-xs mr-1" />
                              <span className="text-xs text-gray-600">
                                {formatAgentRating(property.agent.rating)} ({property.agent.total_sales}{" "}
                                {t('propertyCard.sales') || 'sales'})
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactClick(property);
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <FaPhone size={12} />
                            </button>
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                              <FaEnvelope size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                        onClick={() => navigate(`/properties/${property.id}`)}
                      >
                        {t('propertyCard.viewDetails') || 'View Details'}
                      </button>
                      <button
                        className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition-colors text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactClick(property);
                        }}
                      >
                        {t('propertyCard.contact') || 'Contact'}
                      </button>
                      <button
                        className="border border-red-600 text-red-600 py-2 px-3 rounded hover:bg-red-50 transition-colors text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsaveProperty(property.id);
                        }}
                        disabled={isUnsaving}
                        title={t('propertyCard.unsave') || 'Remove from saved'}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showPhoneModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPhone size={24} />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                {t('contactModal.title') || 'Contact Information'}
              </h3>

              {selectedProperty.agent ? (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">
                    {t('contactModal.agentContact') || 'Agent Contact'}
                  </div>
                  <div className="font-medium text-lg">
                    {selectedProperty.agent.agency_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('contactModal.agent') || 'Agent'}: {selectedProperty.agent.user.username}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('contactModal.license') || 'License'}: {selectedProperty.agent.licence_number}
                  </div>
                </div>
              ) : selectedProperty.owner ? (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">
                    {t('contactModal.propertyOwner') || 'Property Owner'}
                  </div>
                  <div className="font-medium text-lg">
                    {selectedProperty.owner.username}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">
                    {t('contactModal.propertyOwner') || 'Property Owner'}
                  </div>
                  <div className="font-medium text-lg">
                    {t('contactModal.propertyOwner') || 'Property Owner'}
                  </div>
                </div>
              )}

              {/* Phone Number Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {selectedProperty.agent?.user.phone_number ||
                    selectedProperty.owner?.phone_number ||
                    "+998 90 123 45 67"}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedProperty.agent
                    ? t('contactModal.agentPhoneNumber') || 'Agent Phone Number'
                    : t('contactModal.ownerPhoneNumber') || 'Owner Phone Number'}
                </div>
              </div>

              {/* Agent Stats (if agent exists) */}
              {selectedProperty.agent && (
                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-600">
                      {formatAgentRating(selectedProperty.agent.rating)}
                    </div>
                    <div className="text-gray-600">
                      {t('contactModal.rating') || 'Rating'}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="font-semibold text-green-600">
                      {selectedProperty.agent.total_sales}
                    </div>
                    <div className="text-gray-600">
                      {t('propertyCard.sales') || 'Sales'}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const phoneNumber =
                      selectedProperty.agent?.user.phone_number ||
                      selectedProperty.owner?.phone_number ||
                      "+998901234567";
                    handlePhoneCall(phoneNumber);
                    setShowPhoneModal(false);
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaPhone className="mr-2" />
                  {t('contactModal.callNow') || 'Call Now'}
                </button>

                <button
                  onClick={() => {
                    const phoneNumber =
                      selectedProperty.agent?.user.phone_number ||
                      selectedProperty.owner?.phone_number ||
                      "+998901234567";
                    handleCopyPhone(phoneNumber);
                  }}
                  className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" />
                  {t('contactModal.copyNumber') || 'Copy Number'}
                </button>

                <button
                  onClick={() => setShowPhoneModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('contactModal.close') || 'Close'}
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <FaInfoCircle className="mr-1" />
                  {t('contactModal.contactHours') || 'Available 9 AM - 6 PM'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedProperties;
