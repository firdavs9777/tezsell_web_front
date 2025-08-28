import React, { useState } from 'react';
import { RootState } from "@store/index";
import { useGetAgentPropertiesQuery } from "@store/slices/realEstate";
import { useSelector } from "react-redux";
import { Property } from '@store/type';





// Remove this interface since you already have PaginatedResponse<T>

interface EditModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
}
type PropertyType = "apartment" | "house" | "townhouse" | "villa" | "commercial" | "office" | "land" | "warehouse";

const EditPropertyModal: React.FC<EditModalProps> = ({ property, isOpen, onClose, onSave }) => {
  const [editData, setEditData] = useState(property);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Property</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData({...editData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={editData.bedrooms}
                  onChange={(e) => setEditData({...editData, bedrooms: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  value={editData.bathrooms}
                  onChange={(e) => setEditData({...editData, bathrooms: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Meters</label>
                <input
                  type="number"
                  value={editData.square_meters}
                  onChange={(e) => setEditData({...editData, square_meters: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={editData.property_type}
                  onChange={(e) => setEditData({...editData, property_type: e.target.value as PropertyType})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={editData.address}
                onChange={(e) => setEditData({...editData, address: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AgentProperties = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || '';
  const agentId = userInfo?.agent_info?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const { data: agentProperties, isLoading, error } = useGetAgentPropertiesQuery({
    token: token,
    agentId: agentId?.toString() || ''
  }, {
    skip: !agentId || !token
  });

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
  };

  const handleSaveProperty = (updatedProperty: Property) => {
    // Here you would typically make an API call to update the property
    console.log('Saving property:', updatedProperty);
    // You can add a mutation here to update the property
  };

  const formatPrice = (price: string, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    });
    return formatter.format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg">Error loading properties</div>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    );
  }

  const properties = agentProperties?.results || [];
  const totalCount = agentProperties?.count || 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
        <p className="text-gray-600">Manage your real estate listings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
          <div className="text-gray-600">Total Properties</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-2xl font-bold text-green-600">
            {properties.filter(p => p.listing_type === 'sale').length}
          </div>
          <div className="text-gray-600">For Sale</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-2xl font-bold text-purple-600">
            {properties.filter(p => p.listing_type === 'rent').length}
          </div>
          <div className="text-gray-600">For Rent</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-2xl font-bold text-orange-600">
            {properties.filter(p => p.is_featured).length}
          </div>
          <div className="text-gray-600">Featured</div>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Property Listings</h2>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600">Start by adding your first property listing</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {properties.map((property) => (
              <div key={property.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                  {/* Property Image */}
                  <div className="flex-shrink-0 mb-4 lg:mb-0">
                    <img
                      src={property.main_image || ""}
                      alt={property.title}
                      className="w-full lg:w-32 lg:h-24 object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{property.address}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {property.property_type_display}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.listing_type === 'sale'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {property.listing_type}
                          </span>
                          {property.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>{property.bedrooms} beds</span>
                          <span>{property.bathrooms} baths</span>
                          <span>{property.square_meters} m²</span>
                          <span>{property.views_count} views</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start lg:items-end mt-4 lg:mt-0">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatPrice(property.price, property.currency)}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {formatPrice(property.price_per_sqm, property.currency)}/m²
                        </div>
                        <div className="text-sm text-gray-500 mb-3">
                          Listed {formatDate(property.created_at)}
                        </div>
                        <button
                          onClick={() => handleEdit(property)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Edit Property
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {agentProperties && agentProperties.count > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {properties.length} of {totalCount} properties
            </div>
            <div className="flex space-x-2">
              {agentProperties.previous && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {agentProperties.next && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
          onSave={handleSaveProperty}
        />
      )}
    </div>
  );
};

export default AgentProperties;
