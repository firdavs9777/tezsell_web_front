import {
  Award,
  Calendar,
  MapPin,
  Star,
  Phone,
  Mail,
  User,
  Building,
  TrendingUp,
  Shield,
  MessageCircle,
  ArrowLeft,
  Copy,
  ExternalLink,
  Clock,
  Loader,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetAgentByIdQuery,
  useGetAgentPropertiesQuery,
} from "@store/slices/realEstate";

// Updated interfaces to match your RTK Query response structure
interface AgentDetailProps {
  test?: string;
}

const AgentDetail: React.FC<AgentDetailProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "properties" | "reviews"
  >("overview");

  // Use RTK Query hooks
  const {
    data: agentResponse,
    isLoading: agentLoading,
    error: agentError,
    isError: isAgentError,
  } = useGetAgentByIdQuery(id!, {
    skip: !id, // Skip the query if no ID is provided
  });

  const {
    data: agentPropertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useGetAgentPropertiesQuery(id!, {
    skip: !id, // Only skip if no ID is provided
  });

  // Extract data from the response structure
  const agent = agentResponse?.agent;
  if (propertiesError) return <div>Error</div>;

  const handlePhoneCall = (phoneNumber: string): void => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleCopyPhone = async (phoneNumber: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      console.log("Phone number copied to clipboard");
    } catch (err) {
      console.error("Failed to copy phone number:", err);
    }
  };

  const handleContactClick = (): void => {
    setShowPhoneModal(true);
  };

  const getAgentName = () => {
    return agent?.user?.username || "Agent";
  };

  const getPhoneNumber = () => {
    return agent?.user?.phone_number || "";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  };

  const StarRating: React.FC<{
    rating: number;
    size?: number;
    showNumber?: boolean;
  }> = ({ rating, size = 20, showNumber = true }) => {
    const numRating = rating || 0;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < numRating ? "text-yellow-400 fill-current" : "text-gray-300"
            }
          />
        ))}
        {showNumber && (
          <span className="text-sm text-gray-600 ml-2">
            ({numRating.toFixed(1)})
          </span>
        )}
      </div>
    );
  };

  // Handle loading state
  if (agentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading agent details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isAgentError) {
    const errorMessage =
      agentError && "status" in agentError
        ? `Error ${agentError.status}: Failed to load agent details`
        : "Failed to load agent details";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Agent
            </h2>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where agent is not found
  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate("/agents")}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Agents
            </button>
          </div>
        </div>
      </div>

      {/* Agent Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Agent Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {agent.user?.profile_image ? (
                  <img
                    src={agent.user.profile_image}
                    alt={getAgentName()}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={64} className="text-white opacity-80" />
                )}
              </div>
            </div>

            {/* Agent Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {agent.user.username}
                  </h1>
                  <p className="text-xl text-blue-100 mb-3">
                    {agent.agency_name}
                  </p>

                  {agent.is_verified && (
                    <div className="flex items-center mb-3">
                      <Shield size={20} className="text-green-400 mr-2" />
                      <span className="text-green-100 font-medium">
                        Verified Agent
                      </span>
                    </div>
                  )}

                  <div className="flex items-center mb-4">
                    <StarRating rating={Number(agent.rating)} size={24} />
                    <span className="text-white ml-3">•</span>
                    <span className="text-blue-100 ml-3">
                      {agent.total_sales} sales
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleContactClick}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
                  >
                    <Phone size={18} className="mr-2" />
                    Contact Agent
                  </button>
                  <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg flex items-center transition-colors">
                    <Mail size={18} className="mr-2" />
                    Send Message
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {agent.years_experience}
                  </div>
                  <div className="text-blue-100 text-sm">Years Experience</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{agent.total_sales}</div>
                  <div className="text-blue-100 text-sm">Properties Sold</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {agentPropertiesData?.count || 0}
                  </div>
                  <div className="text-blue-100 text-sm">Active Listings</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="text-2xl font-bold">
                    {agentPropertiesData?.count || 0}
                  </div>
                  <div className="text-blue-100 text-sm">Total Properties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {["overview", "properties", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  About {agent.user.username}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Building
                      size={20}
                      className="text-gray-400 mr-3 mt-1 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">Agency</h3>
                      <p className="text-gray-600">{agent.agency_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Award
                      size={20}
                      className="text-gray-400 mr-3 mt-1 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        License Number
                      </h3>
                      <p className="text-gray-600">{agent.licence_number}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <TrendingUp
                      size={20}
                      className="text-gray-400 mr-3 mt-1 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Specialization
                      </h3>
                      <p className="text-gray-600">{agent.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar
                      size={20}
                      className="text-gray-400 mr-3 mt-1 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Member Since
                      </h3>
                      <p className="text-gray-600">
                        {formatDate(agent.created_at)}
                      </p>
                    </div>
                  </div>

                  {agent.verified_at && (
                    <div className="flex items-start">
                      <Shield
                        size={20}
                        className="text-green-500 mr-3 mt-1 flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Verified Since
                        </h3>
                        <p className="text-gray-600">
                          {formatDate(agent.verified_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  Performance Metrics
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {Number(agent.rating).toFixed(1)}
                    </div>
                    <div className="text-gray-600 mt-1">Average Rating</div>
                    <StarRating
                      rating={agent.rating}
                      size={16}
                      showNumber={false}
                    />
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {agent.total_sales}
                    </div>
                    <div className="text-gray-600 mt-1">Properties Sold</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {agentPropertiesData?.count || 0}
                    </div>
                    <div className="text-gray-600 mt-1">Active Listings</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      {agent.years_experience}
                    </div>
                    <div className="text-gray-600 mt-1">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-400 mr-3" />
                      <span className="text-gray-600">
                        {agent.user.phone_number}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyPhone(agent.user.phone_number)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-600">Contact via platform</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-600">{agent.agency_name}</span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Verification Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Shield
                      size={16}
                      className={`mr-3 ${
                        agent.is_verified ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        agent.is_verified ? "text-green-600" : "text-gray-600"
                      }
                    >
                      {agent.is_verified
                        ? "Verified Agent"
                        : "Pending Verification"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Award size={16} className="text-blue-500 mr-3" />
                    <span className="text-gray-600">Licensed Professional</span>
                  </div>
                  <div className="flex items-center">
                    <Building size={16} className="text-purple-500 mr-3" />
                    <span className="text-gray-600">Registered Agency</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleContactClick}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Phone size={16} className="mr-2" />
                    Call Now
                  </button>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <MessageCircle size={16} className="mr-2" />
                    Send Message
                  </button>
                  <button
                    onClick={() => setActiveTab("properties")}
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View Properties
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "properties" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">
              Agent's Properties ({agentPropertiesData?.count || 0})
            </h2>

            {propertiesLoading ? (
              <div className="text-center py-12">
                <Loader className="animate-spin mx-auto mb-4" size={48} />
                <p className="text-gray-600">Loading properties...</p>
              </div>
            ) : agentPropertiesData?.results &&
              agentPropertiesData.results.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agentPropertiesData.results.map((property) => (
                    <div
                      key={property.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-blue-600 font-bold mb-2">
                        {formatPrice(property.price)}
                      </p>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span className="capitalize">
                            {property.property_type?.replace("_", " ")}
                          </span>
                          <span className="capitalize">
                            For {property.listing_type}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-1" />
                          <span>
                            {property.district}, {property.city}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{property.square_meters} m²</span>
                          {property.bedrooms && (
                            <span>
                              {property.bedrooms} bed • {property.bathrooms}{" "}
                              bath
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 border-t pt-2">
                        Listed {formatDate(property.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600">
                  This agent's properties will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Client Reviews</h2>
            <div className="text-center py-12">
              <Star size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-600">
                Client reviews and testimonials will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={24} />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                Contact {getAgentName()}
              </h3>

              <div className="mb-4">
                <div className="text-gray-600 mb-2">Real Estate Agent</div>
                <div className="font-medium text-lg">{agent.agency_name}</div>
                <div className="text-sm text-gray-500">
                  License: {agent.licence_number}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {getPhoneNumber()}
                </div>
                <div className="text-sm text-gray-600">Agent Phone Number</div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="font-semibold text-blue-600">
                    {Number(agent.rating).toFixed(1)}
                  </div>
                  <div className="text-gray-600">Rating</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="font-semibold text-green-600">
                    {agent.total_sales}
                  </div>
                  <div className="text-gray-600">Sales</div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    handlePhoneCall(getPhoneNumber());
                    setShowPhoneModal(false);
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Phone className="mr-2" size={16} />
                  Call Now
                </button>

                <button
                  onClick={() => handleCopyPhone(getPhoneNumber())}
                  className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <Copy className="mr-2" size={16} />
                  Copy Number
                </button>

                <button
                  onClick={() => setShowPhoneModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <Clock className="mr-1" size={12} />
                  Contact hours: 9 AM - 8 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetail;
