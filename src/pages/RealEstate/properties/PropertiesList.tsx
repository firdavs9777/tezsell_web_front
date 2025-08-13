import {
  useGetPropertiesQuery,
  useGetSavedPropertiesQuery,
  useToggleSavePropertyMutation,
} from "@store/slices/realEstate";
import {
  GetPropertiesQueryParams,
  Property,
  RealEstateAgent,
} from "@store/type";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBath,
  FaBed,
  FaCar,
  FaCopy,
  FaEnvelope,
  FaEye,
  FaFilter,
  FaHeart,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaRegHeart,
  FaSearch,
  FaSpinner,
  FaStar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// User interface for owner info
interface User {
  id: number;
  username: string;
  phone_number: string;
  user_type: string;
}

// Extended Property interface that properly overrides the base Property interface
interface ExtendedProperty extends Omit<Property, "owner" | "agent"> {
  property_type_display?: string;
  listing_type_display?: string;
  main_image?: string | null;
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
  // Keep the original agent ID if needed
  agent_id?: number;
}

interface PropertyCardProps {
  property: ExtendedProperty;
  isSaved: boolean;
  onToggleSave: (propertyId: string) => void;
  onContactClick: (property: ExtendedProperty) => void;
}

const PropertiesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(
    new Set()
  );
  const { t } = useTranslation();
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] =
    useState<ExtendedProperty | null>(null);

  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useGetPropertiesQuery({
    page: currentPage,
    page_size: 12,
    search: searchTerm || undefined,
    listing_type:
      filterType !== "all" ? (filterType as "sale" | "rent") : undefined,
    property_type: propertyType !== "all" ? propertyType : undefined,
    ordering: "-is_featured,-created_at",
  } as GetPropertiesQueryParams);

  const { data: savedPropertiesData } = useGetSavedPropertiesQuery();
  const [toggleSaveProperty] = useToggleSavePropertyMutation();

  // Update saved properties when data changes
  useEffect(() => {
    if (savedPropertiesData?.results) {
      const savedIds = new Set(
        savedPropertiesData.results.map(
          (saved: any) => saved.property.id || saved.property
        )
      );
      setSavedPropertyIds(savedIds);
    }
  }, [savedPropertiesData]);

  const handleToggleSave = async (propertyId: string): Promise<void> => {
    try {
      await toggleSaveProperty(propertyId).unwrap();

      // Optimistically update local state
      setSavedPropertyIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
          newSet.delete(propertyId);
        } else {
          newSet.add(propertyId);
        }
        return newSet;
      });
    } catch (error) {
      console.error(t('errors.toggleSaveFailed'), error);
    }
  };

  const handleContactClick = (property: ExtendedProperty): void => {
    setSelectedProperty(property);
    setShowPhoneModal(true);
  };

  const handlePhoneCall = (phoneNumber: string): void => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleCopyPhone = async (phoneNumber: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      console.log(t('errors.phoneCopied'));
      // You could add a toast notification here
    } catch (err) {
      console.error(t('errors.copyFailed'), err);
    }
  };

  const formatPrice = (
    price: string | number,
    currency: string,
    listingType: "sale" | "rent"
  ): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    const formatted = new Intl.NumberFormat("en-US").format(numPrice);
    const symbol =
      currency === "USD" ? "$" : currency === "UZS" ? "so'm" : currency;
    return listingType === "rent"
      ? `${symbol}${formatted}${t('pricing.month')}`
      : `${symbol}${formatted}`;
  };

  // Helper function to safely get property display values
  const getPropertyDisplayValue = (
    property: ExtendedProperty,
    field: string,
    fallback: string
  ): string => {
    const value = (property as any)[field];
    return value || fallback;
  };

  // Helper function to safely access nested agent properties
  const getAgentInfo = (agent: any): RealEstateAgent | null => {
    if (agent && typeof agent === "object" && agent.id) {
      return agent as RealEstateAgent;
    }
    return null;
  };

  const getPropertyFeatures = (property: ExtendedProperty): string[] => {
    const features: string[] = [];
    if (property.has_balcony) features.push(t('propertyCard.balcony'));
    if (property.has_garage) features.push(t('propertyCard.garage'));
    if (property.has_garden) features.push(t('propertyCard.garden'));
    if (property.has_pool) features.push(t('propertyCard.pool'));
    if (property.has_elevator) features.push(t('propertyCard.elevator'));
    if (property.is_furnished) features.push(t('propertyCard.furnished'));
    return features;
  };

  // Helper function to safely format agent rating
  const formatAgentRating = (rating: string | number): string => {
    if (typeof rating === "string") {
      return parseFloat(rating).toFixed(1);
    }
    return (rating || 0).toFixed(1);
  };

  // PropertyCard component
  const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    isSaved,
    onToggleSave,
    onContactClick,
  }) => {
    const navigate = useNavigate();
    const defaultImage = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop`;
    const redirectHandler = (id: string) => navigate(`/properties/${id}`);

    const handleSaveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleSave(property.id);
    };

    const handleContactClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onContactClick(property);
    };

    // Safely access agent information
    const agent = getAgentInfo(property.agent);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div
          className="relative cursor-pointer"
          onClick={() => redirectHandler(property.id)}
        >
          <img
            src={property.main_image || defaultImage}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          {property.is_featured && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
              {t('propertyCard.featured')}
            </span>
          )}
          <button
            onClick={handleSaveClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {isSaved ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-500" />
            )}
          </button>
          <span className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold capitalize">
            {getPropertyDisplayValue(
              property,
              "listing_type_display",
              `${property.listing_type === 'sale' ? t('filterOptions.forSale') : t('filterOptions.forRent')}`
            )}
          </span>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
            <FaEye className="mr-1" size={12} />
            {property.views_count}
          </div>
        </div>

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
            {formatPrice(
              property.price,
              property.currency,
              property.listing_type
            )}
          </div>

          {/* Property Features */}
          <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center">
                <FaBed className="mr-1" />
                <span>{property.bedrooms} {t('propertyCard.bed')}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <FaBath className="mr-1" />
                <span>{property.bathrooms} {t('propertyCard.bath')}</span>
              </div>
            )}
            <div className="flex items-center">
              <FaCar className="mr-1" />
              <span>{property.parking_spaces} {t('propertyCard.parking')}</span>
            </div>
            <div className="flex items-center">
              <FaHome className="mr-1" />
              <span>{property.square_meters} m²</span>
            </div>
          </div>

          {/* Property Type and Features */}
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium mb-1 capitalize">
              {getPropertyDisplayValue(
                property,
                "property_type_display",
                t(`filterOptions.${property.property_type}`) || property.property_type.replace("_", " ")
              )}
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
          {agent && (
            <div className="border-t pt-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">
                  {agent.agency_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {agent.agency_name}
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 text-xs mr-1" />
                    <span className="text-xs text-gray-600">
                      {formatAgentRating(agent.rating)} ({agent.total_sales}{" "}
                      {t('propertyCard.sales')})
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleContactClick}
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
              onClick={() => redirectHandler(property.id)}
            >
              {t('propertyCard.viewDetails')}
            </button>
            <button
              className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition-colors text-sm"
              onClick={handleContactClick}
            >
              {t('propertyCard.contact')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      refetchProperties();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filterType, propertyType, refetchProperties]);

  const properties = propertiesData?.results || [];
  const totalProperties = propertiesData?.count || 0;
  const savedCount = savedPropertyIds.size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 overflow-hidden">
        {/* Background SVG */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/assets/properties.svg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('header.property')}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('header.sub_property')}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-lg shadow-lg">
            <div className="relative flex-1">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">{t('filterOptions.saleAndRent')}</option>
                <option value="sale">{t('filterOptions.forSale')}</option>
                <option value="rent">{t('filterOptions.forRent')}</option>
              </select>

              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">{t('filterOptions.allTypes')}</option>
                <option value="apartment">{t('filterOptions.apartment')}</option>
                <option value="house">{t('filterOptions.house')}</option>
                <option value="townhouse">{t('filterOptions.townhouse')}</option>
                <option value="villa">{t('filterOptions.villa')}</option>
                <option value="commercial">{t('filterOptions.commercial')}</option>
                <option value="office">{t('filterOptions.office')}</option>
              </select>

              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 bg-white">
                <FaFilter size={16} />
                {t('search.filters')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count and Loading */}
        <div className="flex justify-between items-center mb-6">
          <div>
            {propertiesLoading ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span>{t('results.loadingProperties')}</span>
              </div>
            ) : (
              <h2 className="text-xl font-semibold">
                {totalProperties} {t('results.propertiesFound')}
              </h2>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {savedCount} {t('results.propertiesSaved')}
          </div>
        </div>

        {/* Error State */}
        {propertiesError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            <p>{t('results.failedToLoad')}</p>
          </div>
        )}

        {/* Properties Grid */}
        {propertiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading skeletons */}
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
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaSearch size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('results.noPropertiesFound')}
            </h3>
            <p className="text-gray-600">{t('results.tryAdjusting')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <PropertyCard
                key={property.id}
                property={property as ExtendedProperty}
                isSaved={savedPropertyIds.has(property.id)}
                onToggleSave={handleToggleSave}
                onContactClick={handleContactClick}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {propertiesData && propertiesData.count > 12 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('pagination.previous')}
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {t('pagination.page')} {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!propertiesData.next}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('pagination.next')}
              </button>
            </div>
          </div>
        )}

        {/* Saved Properties Floating Counter */}
        {savedCount > 0 && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
            <FaHeart className="inline mr-2" />
            {savedCount} {t('results.saved')}
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
                {t('contactModal.title')}
              </h3>

              {selectedProperty.agent ? (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">{t('contactModal.agentContact')}</div>
                  <div className="font-medium text-lg">
                    {selectedProperty.agent.agency_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('contactModal.agent')}: {selectedProperty.agent.user.username}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('contactModal.license')}: {selectedProperty.agent.licence_number}
                  </div>
                </div>
              ) : selectedProperty.owner ? (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">{t('contactModal.propertyOwner')}</div>
                  <div className="font-medium text-lg">
                    {selectedProperty.owner.username}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">{t('contactModal.propertyOwner')}</div>
                  <div className="font-medium text-lg">{t('contactModal.propertyOwner')}</div>
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
                    ? t('contactModal.agentPhoneNumber')
                    : t('contactModal.ownerPhoneNumber')}
                </div>
              </div>

              {/* Agent Stats (if agent exists) */}
              {selectedProperty.agent && (
                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="font-semibold text-blue-600">
                      {formatAgentRating(selectedProperty.agent.rating)}
                    </div>
                    <div className="text-gray-600">{t('contactModal.rating')}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="font-semibold text-green-600">
                      {selectedProperty.agent.total_sales}
                    </div>
                    <div className="text-gray-600">{t('propertyCard.sales')}</div>
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
                  {t('contactModal.callNow')}
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
                  {t('contactModal.copyNumber')}
                </button>

                <button
                  onClick={() => setShowPhoneModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('contactModal.close')}
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <FaInfoCircle className="mr-1" />
                  {t('contactModal.contactHours')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesList;
