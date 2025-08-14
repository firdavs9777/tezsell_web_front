import {
  useCreatePropertyInquiryMutation,
  useGetPropertyByIdQuery,
  useToggleSavePropertyMutation,
} from '@store/slices/realEstate';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaBath,
  FaBed,
  FaBuilding,
  FaCalendarAlt,
  FaCar,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaComments,
  FaCopy,
  FaEnvelope,
  FaExpand,
  FaEye,
  FaHeart,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPhone,
  FaRegHeart,
  FaShare,
  FaSpinner,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Property } from '../../../store/type';
import { PropertyMap } from '../shared/MapComponents';

// Import map styles
import '../shared/MapComponents/MapStyles.css';

// Extended interfaces to match API response
interface PropertyOwner {
  id: number;
  username: string;
  phone_number?: string;
  user_type: string;
  email?: string;
}

interface RealEstateAgent {
  id: number;
  user: number;
  agency_name: string;
  licence_number: string;
  is_verified: boolean;
  rating: number;
  total_sales: number;
  years_experience: number;
  specialization: string;
  created_at: string;
  email?: string;
  phone_number?: string;
}

interface ExtendedProperty extends Omit<Property, 'owner' | 'agent'> {
  owner?: PropertyOwner;
  agent?: RealEstateAgent;
  // Add coordinates for map
  latitude?: number;
  longitude?: number;
}

interface PropertyResponse {
  success: boolean;
  property: ExtendedProperty;
  related_properties: ExtendedProperty[];
}

const RealEstateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showMapFullscreen, setShowMapFullscreen] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    inquiry_type: 'info' as 'viewing' | 'info' | 'offer' | 'callback',
    message: '',
    preferred_contact_time: '',
    offered_price: ''
  });

  // API calls
  const {
    data: propertyResponse,
    isLoading,
    error
  } = useGetPropertyByIdQuery(id!);

  const [toggleSaveProperty] = useToggleSavePropertyMutation();
  const [createInquiry, { isLoading: isSubmittingInquiry }] = useCreatePropertyInquiryMutation();

  // Type the response data properly
  const typedResponse = propertyResponse as PropertyResponse | undefined;
  const property = typedResponse?.property;
  const relatedProperties = typedResponse?.related_properties || [];

  // Sample images for display (replace with actual property images)
  const propertyImages = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
  ];

  // Mock coordinates for now (you can remove this when your API provides real coordinates)
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

  // Ensure property has coordinates before passing to map
  const ensureCoordinates = (property: ExtendedProperty): Property => {
    const withCoords = getPropertyWithCoordinates(property);
    return {
      ...withCoords,
      latitude: withCoords.latitude!,
      longitude: withCoords.longitude!
    } as Property;
  };

  // ESC key handler and body scroll prevention
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showMapFullscreen) {
          setShowMapFullscreen(false);
        } else if (showImageModal) {
          setShowImageModal(false);
        } else if (showInquiryForm) {
          setShowInquiryForm(false);
        } else if (showPhoneModal) {
          setShowPhoneModal(false);
        }
      }
    };

    if (showMapFullscreen || showImageModal || showInquiryForm || showPhoneModal) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [showMapFullscreen, showImageModal, showInquiryForm, showPhoneModal]);

  const handleSaveProperty = async () => {
    if (!id) return;
    try {
      await toggleSaveProperty(id);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error(t('alerts.savePropertyFailed'), error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this ${property.property_type} for ${property.listing_type}`,
          url: window.location.href,
        });
      } catch (error: unknown) {
        console.error(error)
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert(t('alerts.linkCopied'));
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('alerts.linkCopied'));
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await createInquiry({
        property: id,
        inquiry_type: inquiryData.inquiry_type,
        message: inquiryData.message,
        preferred_contact_time: inquiryData.preferred_contact_time,
        offered_price: inquiryData.offered_price ? parseFloat(inquiryData.offered_price) : undefined,
      }).unwrap();

      setShowInquiryForm(false);
      setInquiryData({
        inquiry_type: 'info',
        message: '',
        preferred_contact_time: '',
        offered_price: ''
      });
      alert(t('inquiry.inquirySentSuccess'));
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      alert(t('inquiry.inquirySentError'));
    }
  };

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleCopyPhone = async (phoneNumber: string) => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      alert(t('alerts.phoneCopied'));
    } catch (error: unknown) {
      console.error(error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = phoneNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(t('alerts.phoneCopied'));
    }
  };

  const handleEmailContact = (contactInfo: PropertyOwner | RealEstateAgent | undefined) => {
    if (!property || !contactInfo) return;

    const subject = `${t('alerts.emailSubject')} ${property.title}`;
    const body = t('alerts.emailBody', {
      title: property.title,
      address: property.address
    }).replace(/\\n/g, '\n');
    const email = contactInfo.email || 'contact@example.com';

    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const formatPrice = (price: number, currency: string, listingType: string) => {
    const formatted = new Intl.NumberFormat("en-US").format(price);
    const symbol = currency === "USD" ? "$" : currency === "UZS" ? "so'm" : currency;
    return listingType === "rent" ? `${symbol}${formatted}/month` : `${symbol}${formatted}`;
  };

  const getPropertyFeatures = (property: ExtendedProperty): string[] => {
    const features: string[] = [];
    if (property.has_balcony) features.push(t('features.balcony'));
    if (property.has_garage) features.push(t('features.garage'));
    if (property.has_garden) features.push(t('features.garden'));
    if (property.has_pool) features.push(t('features.swimmingPool'));
    if (property.has_elevator) features.push(t('features.elevator'));
    if (property.is_furnished) features.push(t('features.furnished'));
    return features;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <FaSpinner className="animate-spin text-blue-600" size={24} />
          <span>{t('loading.loadingDetails')}</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('loading.propertyNotFound')}</h2>
          <p className="text-gray-600 mb-4">{t('loading.propertyNotFoundMessage')}</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('loading.backToProperties')}
          </button>
        </div>
      </div>
    );
  }

  // Convert ExtendedProperty to MapProperty format for the map component
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

  const features = getPropertyFeatures(property);
  const propertyWithCoords = getPropertyWithCoordinates(property);
  const propertyForMap = convertToMapProperty(property);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            {t('navigation.backToProperties')}
          </button>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <FaMapMarkerAlt className="mr-2" />
                <span>{property.address}, {property.district}, {property.city}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <FaEye className="mr-1" />
                  <span>{property.views_count} {t('propertyInfo.views')}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  <span>{t('propertyInfo.listed')} {new Date(property.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatPrice(property.price, property.currency, property.listing_type)}
              </div>
              {property.listing_type === 'sale' && property.price_per_sqm && (
                <div className="text-sm text-gray-600">
                  {Math.round(property.price_per_sqm)} {property.currency}{t('propertyInfo.pricePerSqm')}
                </div>
              )}
              <div className="flex items-center space-x-2 mt-4">
                <button
                  onClick={handleSaveProperty}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    isSaved
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {isSaved ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
                  {isSaved ? t('propertyInfo.saved') : t('propertyInfo.save')}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaShare className="mr-2" />
                  {t('propertyInfo.share')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={propertyImages[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70"
                >
                  <FaExpand />
                </button>
                {propertyImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnail navigation */}
              {propertyImages.length > 1 && (
                <div className="flex space-x-2 mt-4">
                  {propertyImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Location</h2>
                <button
                  onClick={() => setShowMapFullscreen(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <FaExpand className="mr-1" size={12} />
                  View Fullscreen
                </button>
              </div>

              <div className="h-64 rounded-lg overflow-hidden">
                <PropertyMap
                  properties={[propertyForMap]}
                  center={[propertyWithCoords.latitude!, propertyWithCoords.longitude!]}
                  zoom={15}
                  height="100%"
                  showControls={false}
                  className="rounded-lg"
                />
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  <span className="font-medium">{property.address}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {property.district}, {property.city}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('propertyDetails.title')}</h2>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaBed className="mx-auto text-blue-600 mb-2" size={24} />
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">{t('propertyDetails.bedrooms')}</div>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaBath className="mx-auto text-blue-600 mb-2" size={24} />
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">{t('propertyDetails.bathrooms')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaHome className="mx-auto text-blue-600 mb-2" size={24} />
                  <div className="font-semibold">{property.square_meters}m²</div>
                  <div className="text-sm text-gray-600">{t('propertyDetails.floorArea')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaCar className="mx-auto text-blue-600 mb-2" size={24} />
                  <div className="font-semibold">{property.parking_spaces}</div>
                  <div className="text-sm text-gray-600">{t('propertyDetails.parking')}</div>
                </div>
              </div>

              {/* Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">{t('propertyDetails.basicInformation')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('propertyDetails.propertyType')}</span>
                      <span className="font-medium capitalize"> {property.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('propertyDetails.listingType')}</span>
                      <span className="font-medium capitalize">
                        {property.listing_type === 'sale' ? t('propertyDetails.forSale') : t('propertyDetails.forRent')}
                      </span>
                    </div>
                    {property.year_built && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('propertyDetails.yearBuilt')}</span>
                        <span className="font-medium">{property.year_built}</span>
                      </div>
                    )}
                    {property.floor && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('propertyDetails.floor')}</span>
                        <span className="font-medium">
                          {property.floor}{property.total_floors && ` ${t('propertyDetails.of')} ${property.total_floors}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">{t('propertyDetails.featuresAmenities')}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <FaCheck className="text-green-500 mr-2" size={12} />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('sections.description')}</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Nearby Amenities */}
            {(property.metro_distance || property.school_distance || property.hospital_distance || property.shopping_distance) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t('sections.nearbyAmenities')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.metro_distance && (
                    <div className="text-center">
                      <div className="font-medium">{t('amenities.metro')}</div>
                      <div className="text-sm text-gray-600">{property.metro_distance}m {t('amenities.away')}</div>
                    </div>
                  )}
                  {property.school_distance && (
                    <div className="text-center">
                      <div className="font-medium">{t('amenities.school')}</div>
                      <div className="text-sm text-gray-600">{property.school_distance}m {t('amenities.away')}</div>
                    </div>
                  )}
                  {property.hospital_distance && (
                    <div className="text-center">
                      <div className="font-medium">{t('amenities.hospital')}</div>
                      <div className="text-sm text-gray-600">{property.hospital_distance}m {t('amenities.away')}</div>
                    </div>
                  )}
                  {property.shopping_distance && (
                    <div className="text-center">
                      <div className="font-medium">{t('amenities.shopping')}</div>
                      <div className="text-sm text-gray-600">{property.shopping_distance}m {t('amenities.away')}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">{t('contact.title')}</h3>

              {property.agent ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBuilding size={24} />
                  </div>
                  <div className="font-semibold text-lg">{t('contact.professionalListing')}</div>
                  <div className="text-gray-600 mb-2">{t('contact.listedByAgent')}</div>
                  <div className="font-medium text-gray-800 mb-4">{property.agent.agency_name}</div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPhoneModal(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FaPhone className="mr-2" />
                      {t('contact.callAgent')}
                    </button>
                    <button
                      onClick={() => handleEmailContact(property.agent)}
                      className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                    >
                      <FaEnvelope className="mr-2" />
                      {t('contact.emailAgent')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser size={24} />
                  </div>
                  <div className="font-semibold text-lg">{t('contact.byOwner')}</div>
                  <div className="text-gray-600 mb-2">{t('contact.directContact')}</div>
                  <div className="font-medium text-gray-800 mb-4">{property.owner?.username || t('contact.propertyOwner')}</div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPhoneModal(true)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaPhone className="mr-2" />
                      {t('contact.callOwner')}
                    </button>
                    <button
                      onClick={() => handleEmailContact(property.owner)}
                      className="w-full border border-green-600 text-green-600 py-3 px-4 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center"
                    >
                      <FaEnvelope className="mr-2" />
                      {t('contact.emailOwner')}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <FaComments className="mr-2" />
                {t('contact.sendInquiry')}
              </button>
            </div>

            {/* Property Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">{t('propertyStatus.title')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>{t('propertyStatus.availability')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    property.is_active && !property.is_sold
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {property.is_active && !property.is_sold ? t('propertyStatus.available') : t('propertyStatus.notAvailable')}
                  </span>
                </div>
                {property.is_featured && (
                  <div className="flex items-center justify-between">
                    <span>{t('propertyStatus.featured')}</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      {t('propertyStatus.featuredProperty')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>{t('propertyStatus.propertyId')}</span>
                  <span className="text-sm text-gray-600">{property.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">{t('sections.similarProperties')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.slice(0, 3).map((relatedProperty) => (
                <div key={relatedProperty.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop"
                    alt={relatedProperty.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{relatedProperty.title}</h3>
                    <div className="text-blue-600 font-bold text-xl mb-2">
                      {formatPrice(relatedProperty.price, relatedProperty.currency, relatedProperty.listing_type)}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{relatedProperty.district}, {relatedProperty.city}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/properties/${relatedProperty.id}`)}
                      className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('relatedProperties.viewDetails')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Map Modal - FIXED VERSION */}
      {showMapFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking the backdrop (not the map container)
            if (e.target === e.currentTarget) {
              setShowMapFullscreen(false);
            }
          }}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4">
            {/* Close button with higher z-index and better positioning */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMapFullscreen(false);
              }}
              className="absolute top-4 right-4 z-[2000] text-white bg-black bg-opacity-70 hover:bg-opacity-90 p-3 rounded-lg transition-all duration-200 shadow-lg"
              style={{ zIndex: 2000 }}
            >
              <FaTimes size={20} />
            </button>

            {/* Map container with event isolation */}
            <div
              className="w-full h-full rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <PropertyMap
                properties={[propertyForMap]}
                center={[propertyWithCoords.latitude!, propertyWithCoords.longitude!]}
                zoom={16}
                height="100%"
                showControls={true}
                className="rounded-lg"
                hidePropertyCount={true}
                hideLegend={true}
              />
            </div>

            {/* Property info overlay */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg z-[1500] max-w-sm">
              <div className="font-medium text-gray-900 text-sm">{property.title}</div>
              <div className="text-xs text-gray-600 flex items-center mt-1">
                <FaMapMarkerAlt className="mr-1" />
                {property.address}, {property.district}
              </div>
            </div>

            {/* Additional close button in bottom right corner as backup */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMapFullscreen(false);
              }}
              className="absolute bottom-4 right-4 z-[1500] bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors shadow-lg"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Phone Number Modal */}
      {showPhoneModal && property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPhone size={24} />
              </div>

              <h3 className="text-xl font-semibold mb-2">{t('contact.title')}</h3>

              {property.agent ? (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">{t('contact.agentContact')}</div>
                  <div className="font-medium text-lg">{property.agent.agency_name}</div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">{t('contact.propertyOwner')}</div>
                  <div className="font-medium text-lg">{property.owner?.username || t('contact.propertyOwner')}</div>
                </div>
              )}

              {/* Phone Number Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {(property.agent?.phone_number || property.owner?.phone_number) || '+998 90 123 45 67'}
                </div>
                <div className="text-sm text-gray-600">
                  {property.agent ? t('contact.agentPhoneNumber') : t('contact.ownerPhoneNumber')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const phoneNumber = (property.agent?.phone_number || property.owner?.phone_number) || '+998901234567';
                    handlePhoneCall(phoneNumber);
                    setShowPhoneModal(false);
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaPhone className="mr-2" />
                  {t('contact.callNow')}
                </button>

                <button
                  onClick={() => {
                    const phoneNumber = (property.agent?.phone_number || property.owner?.phone_number) || '+998901234567';
                    handleCopyPhone(phoneNumber);
                  }}
                  className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" />
                  {t('contact.copyNumber')}
                </button>

                <button
                  onClick={() => setShowPhoneModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('contact.close')}
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <FaInfoCircle className="mr-1" />
                  {t('contact.contactHours')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t('inquiry.title')}</h3>
              <button
                onClick={() => setShowInquiryForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inquiry.inquiryType')}
                </label>
                <select
                  value={inquiryData.inquiry_type}
                  onChange={(e) => setInquiryData(prev => ({
                    ...prev,
                    inquiry_type: e.target.value as 'viewing' | 'info' | 'offer' | 'callback'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">{t('inquiry.requestInfo')}</option>
                  <option value="viewing">{t('inquiry.scheduleViewing')}</option>
                  <option value="offer">{t('inquiry.makeOffer')}</option>
                  <option value="callback">{t('inquiry.requestCallback')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inquiry.message')}
                </label>
                <textarea
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('inquiry.messagePlaceholder')}
                  required
                />
              </div>

              {inquiryData.inquiry_type === 'offer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('inquiry.offeredPrice')} ({property.currency})
                  </label>
                  <input
                    type="number"
                    value={inquiryData.offered_price}
                    onChange={(e) => setInquiryData(prev => ({ ...prev, offered_price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('inquiry.enterOffer')}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('inquiry.preferredContactTime')}
                </label>
                <input
                  type="text"
                  value={inquiryData.preferred_contact_time}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, preferred_contact_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('inquiry.contactTimePlaceholder')}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInquiryForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('inquiry.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {isSubmittingInquiry ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaPaperPlane className="mr-2" />
                  )}
                  {isSubmittingInquiry ? t('inquiry.sending') : t('inquiry.sendInquiry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={propertyImages[currentImageIndex]}
              alt={property.title}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              <FaTimes />
            </button>
            {propertyImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                >
                  <FaChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                >
                  <FaChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                  {currentImageIndex + 1} / {propertyImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateDetail;
