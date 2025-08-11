import { useGetAgentsQuery } from "@store/slices/realEstate";
import { GetAgentsQueryParams, RealEstateAgent } from "@store/type";
import { Award, Calendar, Copy, Filter, Grid, Info, List, MapPin, Phone, Search, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import

// Use the actual API types instead of redefining them
type Agent = RealEstateAgent;

// Type guard to check if user is an object with username property
const isUserObject = (user: any): user is { username: string; phone_number: string } => {
  return typeof user === 'object' && user !== null && 'username' in user;
};

type ViewMode = 'grid' | 'list';

interface AgentsListProps {
  onAgentSelect?: (agent: Agent) => void;
}

const AgentsList: React.FC<AgentsListProps> = ({ onAgentSelect }) => {
  const navigate = useNavigate(); // Add this hook
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [ordering, setOrdering] = useState<string>('-rating');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const queryParams: GetAgentsQueryParams = {
    search: searchTerm || undefined,
    specialization: specialization || undefined,
    min_rating: minRating ? parseFloat(minRating) : undefined,
    ordering
  };

  const { data: agentsData, isLoading, error, refetch } = useGetAgentsQuery(queryParams);

  const agents: Agent[] = agentsData?.results || [];

  const handleSearch = (): void => {
    refetch();
  };

  const clearFilters = (): void => {
    setSearchTerm('');
    setSpecialization('');
    setMinRating('');
    setOrdering('-rating');
  };

  const handleContactClick = (agent: Agent): void => {
    setSelectedAgent(agent);
    setShowContactModal(true);
  };

  // Modified handleViewProfile to navigate to agent detail page
  const handleViewProfile = (agent: Agent): void => {
    // Navigate to the agent detail page using the agent's ID
    navigate(`/agents/${agent.id}`);

    // Keep the original callback if needed for parent component
    if (onAgentSelect) {
      onAgentSelect(agent);
    }
  };

  const handlePhoneCall = (phoneNumber: string): void => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleCopyPhone = async (phoneNumber: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      console.log('Phone number copied to clipboard');
    } catch (err) {
      console.error('Failed to copy phone number:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Agents</h2>
            <p className="text-red-600 mb-4">Failed to load agents list. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StarRating: React.FC<{ rating: string | number }> = ({ rating }) => {
    const numRating: number = typeof rating === 'string' ? parseFloat(rating) || 0 : rating || 0;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < numRating ? "text-yellow-400 fill-current" : "text-gray-300"}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({numRating.toFixed(1)})</span>
      </div>
    );
  };

  const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
    // Handle the case where user might be a number (ID) or object
    const userName = isUserObject(agent.user) ? agent.user.username : `Agent ${agent.id}`;
    const userPhone = isUserObject(agent.user) ? agent.user.phone_number : '';

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          {/* Agent Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {userName}
              </h3>
              <p className="text-blue-600 font-medium">{agent.agency_name}</p>
              {agent.is_verified && (
                <div className="flex items-center mt-2">
                  <Award size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Verified Agent</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <StarRating rating={agent.rating} />
              <p className="text-sm text-gray-500 mt-1">{agent.total_sales} sales</p>
            </div>
          </div>

          {/* Agent Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-2" />
              <span className="text-sm">{agent.years_experience} years experience</span>
            </div>

            <div className="flex items-start text-gray-600">
              <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">License: {agent.licence_number}</p>
                {userPhone && <p className="text-gray-500">{userPhone}</p>}
              </div>
            </div>
          </div>

          {/* Specialization */}
          {agent.specialization && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Specialization</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{agent.specialization}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleViewProfile(agent)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Profile
            </button>
            <button
              onClick={() => handleContactClick(agent)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AgentListItem: React.FC<{ agent: Agent }> = ({ agent }) => {
    // Handle the case where user might be a number (ID) or object
    const userName = isUserObject(agent.user) ? agent.user.username : `Agent ${agent.id}`;

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {userName}
                </h3>
                <p className="text-blue-600 font-medium">{agent.agency_name}</p>
              </div>
              <div className="text-right">
                <StarRating rating={agent.rating} />
                {agent.is_verified && (
                  <div className="flex items-center justify-end mt-1">
                    <Award size={14} className="text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Verified</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm">{agent.years_experience} years</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Award size={16} className="mr-2" />
                <span className="text-sm">{agent.total_sales} sales</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2" />
                <span className="text-sm">{agent.licence_number}</span>
              </div>
            </div>

            {agent.specialization && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.specialization}</p>
            )}
          </div>

          <div className="ml-6 flex flex-col space-y-2">
            <button
              onClick={() => handleViewProfile(agent)}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Profile
            </button>
            <button
              onClick={() => handleContactClick(agent)}
              className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real Estate Agents</h1>
              <p className="text-gray-600 mt-1">
                Find experienced agents to help with your property needs
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {agentsData?.count || 0} agents found
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search agents, agencies, or specializations..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={specialization}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSpecialization(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Specializations</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="luxury">Luxury Properties</option>
                  <option value="investment">Investment</option>
                </select>

                <select
                  value={minRating}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMinRating(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>

                <select
                  value={ordering}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOrdering(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="-rating">Highest Rated</option>
                  <option value="rating">Lowest Rated</option>
                  <option value="-total_sales">Most Sales</option>
                  <option value="-years_experience">Most Experience</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Search
                </button>
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear Filters
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {agents.length === 0 ? (
          <div className="text-center py-12">
            <Filter size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }>
            {agents.map((agent: Agent) => (
              viewMode === 'grid' ? (
                <AgentCard key={agent.id} agent={agent} />
              ) : (
                <AgentListItem key={agent.id} agent={agent} />
              )
            ))}
          </div>
        )}

        {/* Pagination */}
        {agentsData && agentsData.count > 12 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              {agentsData.previous && (
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Previous
                </button>
              )}
              <span className="px-4 py-2 text-gray-600">
                Page 1 of {Math.ceil(agentsData.count / 12)}
              </span>
              {agentsData.next && (
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={24} />
              </div>

              <h3 className="text-xl font-semibold mb-2">Contact Information</h3>

              <div className="mb-4">
                <div className="text-gray-600 mb-2">Real Estate Agent</div>
                <div className="font-medium text-lg">{selectedAgent.agency_name}</div>
                <div className="text-sm text-gray-500">License: {selectedAgent.licence_number}</div>
                <div className="text-sm text-gray-500">
                  Agent: {isUserObject(selectedAgent.user) ? selectedAgent.user.username : `Agent #${selectedAgent.id}`}
                </div>
              </div>

              {/* Phone Number Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {isUserObject(selectedAgent.user) ? selectedAgent.user.phone_number : '+998 90 123 45 67'}
                </div>
                <div className="text-sm text-gray-600">
                  Agent Phone Number
                </div>
              </div>

              {/* Agent Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="font-semibold text-blue-600">
                    {typeof selectedAgent.rating === 'string'
                      ? parseFloat(selectedAgent.rating).toFixed(1)
                      : selectedAgent.rating.toFixed(1)
                    }
                  </div>
                  <div className="text-gray-600">Rating</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="font-semibold text-green-600">
                    {selectedAgent.total_sales}
                  </div>
                  <div className="text-gray-600">Sales</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const phoneNumber = isUserObject(selectedAgent.user)
                      ? selectedAgent.user.phone_number
                      : '+998901234567';
                    handlePhoneCall(phoneNumber);
                    setShowContactModal(false);
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Phone className="mr-2" size={16} />
                  Call Now
                </button>

                <button
                  onClick={() => {
                    const phoneNumber = isUserObject(selectedAgent.user)
                      ? selectedAgent.user.phone_number
                      : '+998901234567';
                    handleCopyPhone(phoneNumber);
                  }}
                  className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <Copy className="mr-2" size={16} />
                  Copy Number
                </button>

                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <Info className="mr-1" size={12} />
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

export default AgentsList;
