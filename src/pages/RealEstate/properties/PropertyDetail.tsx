import {
    useCreatePropertyInquiryMutation,
    useGetPropertyByIdQuery,
    useToggleSavePropertyMutation,
} from '@store/slices/realEstate';
import React, { useState } from "react";
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
}

interface PropertyResponse {
  success: boolean;
  property: ExtendedProperty;
  related_properties: ExtendedProperty[];
}

const RealEstateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
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

  const handleSaveProperty = async () => {
    if (!id) return;
    try {
      await toggleSaveProperty(id);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Failed to save property:', error);
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
        alert('Property link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
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
      alert('Inquiry sent successfully!');
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
    }
  };

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleCopyPhone = async (phoneNumber: string) => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      alert('Phone number copied to clipboard!');
    } catch (error: unknown) {
      console.error(error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = phoneNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Phone number copied to clipboard!');
    }
  };

  const handleEmailContact = (contactInfo: PropertyOwner | RealEstateAgent | undefined) => {
    if (!property || !contactInfo) return;

    const subject = `Inquiry about: ${property.title}`;
    const body = `Hello,\n\nI am interested in your property "${property.title}" located at ${property.address}.\n\nPlease contact me for more information.\n\nBest regards`;
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
    if (property.has_balcony) features.push("Balcony");
    if (property.has_garage) features.push("Garage");
    if (property.has_garden) features.push("Garden");
    if (property.has_pool) features.push("Swimming Pool");
    if (property.has_elevator) features.push("Elevator");
    if (property.is_furnished) features.push("Furnished");
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
          <span>Loading property details...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const features = getPropertyFeatures(property);

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
            Back to Properties
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
                  <span>{property.views_count} views</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  <span>Listed {new Date(property.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatPrice(property.price, property.currency, property.listing_type)}
              </div>
              {property.listing_type === 'sale' && property.price_per_sqm && (
                <div className="text-sm text-gray-600">
                  {Math.round(property.price_per_sqm)} {property.currency}/m²
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
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaShare className="mr-2" />
                  Share
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

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Property Details</h2>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FaBed className="mx-auto text-blue-600 mb-2" size={24} />
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaBath className="mx-auto text-blue-600 mb-2" size={24} />
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaHome className="mx-auto text-blue-600 mb-2" size={24} />
                  <div className="font-semibold">{property.square_meters}m²</div>
                  <div className="text-sm text-gray-600">Floor Area</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FaCar className="mx-auto text-blue-600 mb-2" size={24} />
                  <div className="font-semibold">{property.parking_spaces}</div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              </div>

              {/* Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-medium capitalize"> {property.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listing Type:</span>
                      <span className="font-medium capitalize">For {property.listing_type}</span>
                    </div>
                    {property.year_built && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year Built:</span>
                        <span className="font-medium">{property.year_built}</span>
                      </div>
                    )}
                    {property.floor && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium">
                          {property.floor}{property.total_floors && ` of ${property.total_floors}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Features & Amenities</h3>
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
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Nearby Amenities */}
            {(property.metro_distance || property.school_distance || property.hospital_distance || property.shopping_distance) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nearby Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.metro_distance && (
                    <div className="text-center">
                      <div className="font-medium">Metro</div>
                      <div className="text-sm text-gray-600">{property.metro_distance}m away</div>
                    </div>
                  )}
                  {property.school_distance && (
                    <div className="text-center">
                      <div className="font-medium">School</div>
                      <div className="text-sm text-gray-600">{property.school_distance}m away</div>
                    </div>
                  )}
                  {property.hospital_distance && (
                    <div className="text-center">
                      <div className="font-medium">Hospital</div>
                      <div className="text-sm text-gray-600">{property.hospital_distance}m away</div>
                    </div>
                  )}
                  {property.shopping_distance && (
                    <div className="text-center">
                      <div className="font-medium">Shopping</div>
                      <div className="text-sm text-gray-600">{property.shopping_distance}m away</div>
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
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>

              {property.agent ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBuilding size={24} />
                  </div>
                  <div className="font-semibold text-lg">Professional Listing</div>
                  <div className="text-gray-600 mb-2">Listed by verified agent</div>
                  <div className="font-medium text-gray-800 mb-4">{property.agent.agency_name}</div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPhoneModal(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FaPhone className="mr-2" />
                      Call Agent
                    </button>
                    <button
                      onClick={() => handleEmailContact(property.agent)}
                      className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                    >
                      <FaEnvelope className="mr-2" />
                      Email Agent
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser size={24} />
                  </div>
                  <div className="font-semibold text-lg">By Owner</div>
                  <div className="text-gray-600 mb-2">Direct contact with property owner</div>
                  <div className="font-medium text-gray-800 mb-4">{property.owner?.username || 'Property Owner'}</div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPhoneModal(true)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaPhone className="mr-2" />
                      Call Owner
                    </button>
                    <button
                      onClick={() => handleEmailContact(property.owner)}
                      className="w-full border border-green-600 text-green-600 py-3 px-4 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center"
                    >
                      <FaEnvelope className="mr-2" />
                      Email Owner
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <FaComments className="mr-2" />
                Send Inquiry
              </button>
            </div>

            {/* Property Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Property Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Availability:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    property.is_active && !property.is_sold
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {property.is_active && !property.is_sold ? 'Available' : 'Not Available'}
                  </span>
                </div>
                {property.is_featured && (
                  <div className="flex items-center justify-between">
                    <span>Featured:</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      Featured Property
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Property ID:</span>
                  <span className="text-sm text-gray-600">{property.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Similar Properties</h2>
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
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phone Number Modal */}
      {showPhoneModal && property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPhone size={24} />
              </div>

              <h3 className="text-xl font-semibold mb-2">Contact Information</h3>

              {property.agent ? (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">Agent Contact</div>
                  <div className="font-medium text-lg">{property.agent.agency_name}</div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="text-gray-600 mb-2">Property Owner</div>
                  <div className="font-medium text-lg">{property.owner?.username || 'Property Owner'}</div>
                </div>
              )}

              {/* Phone Number Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {(property.agent?.phone_number || property.owner?.phone_number) || '+998 90 123 45 67'}
                </div>
                <div className="text-sm text-gray-600">
                  {property.agent ? 'Agent Phone Number' : 'Owner Phone Number'}
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
                  Call Now
                </button>

                <button
                  onClick={() => {
                    const phoneNumber = (property.agent?.phone_number || property.owner?.phone_number) || '+998901234567';
                    handleCopyPhone(phoneNumber);
                  }}
                  className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" />
                  Copy Number
                </button>

                <button
                  onClick={() => setShowPhoneModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <FaInfoCircle className="mr-1" />
                  Contact hours: 9 AM - 8 PM
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
              <h3 className="text-xl font-semibold">Send Inquiry</h3>
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
                  Inquiry Type
                </label>
                <select
                  value={inquiryData.inquiry_type}
                  onChange={(e) => setInquiryData(prev => ({
                    ...prev,
                    inquiry_type: e.target.value as 'viewing' | 'info' | 'offer' | 'callback'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Request Information</option>
                  <option value="viewing">Schedule Viewing</option>
                  <option value="offer">Make Offer</option>
                  <option value="callback">Request Callback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your interest in this property..."
                  required
                />
              </div>

              {inquiryData.inquiry_type === 'offer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offered Price ({property.currency})
                  </label>
                  <input
                    type="number"
                    value={inquiryData.offered_price}
                    onChange={(e) => setInquiryData(prev => ({ ...prev, offered_price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your offer"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Contact Time (Optional)
                </label>
                <input
                  type="text"
                  value={inquiryData.preferred_contact_time}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, preferred_contact_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Weekdays 9 AM - 5 PM"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInquiryForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
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
                  {isSubmittingInquiry ? 'Sending...' : 'Send Inquiry'}
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
