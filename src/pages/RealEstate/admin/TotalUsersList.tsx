import { RootState } from "@store/index";
import {
  useGetDistrictsListQuery,
  useGetRegionsListQuery,
} from "@store/slices/productsApiSlice";
import {
  useDeleteRegisteredUserMutation,
  useGetRegisteredUsersQuery,
  useUpdateRegisteredUserMutation,
} from "@store/slices/users";
import { DistrictsList, RegionsList, User, UsersResponse } from "@store/type";
import React, { useEffect, useMemo, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCog,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaSearch,
  FaStar,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserCheck,
  FaUserShield,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Type definitions for API responses
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface UpdateUserData extends Partial<User> {
  password?: string;
  districtId?: number; // Add district ID for location updates
}

// Delete Confirmation Modal
const DeleteModal: React.FC<{
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (user: User) => void;
  isLoading?: boolean;
}> = ({ user, isOpen, onClose, onConfirm, isLoading = false }) => {
  if (!isOpen || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete User
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.phone_number}</p>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <FaExclamationTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">This will permanently:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Remove user account and data</li>
                    <li>Cancel any active subscriptions</li>
                    <li>Delete associated content</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(user)}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  <span>Delete User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Edit User Modal with Location Update Logic
const EditModal: React.FC<{
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User, updatedData: UpdateUserData) => void;
  isLoading?: boolean;
}> = ({ user, isOpen, onClose, onSave, isLoading = false }) => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
    user_type: "",
    user_role: "",
    is_active: false,
    is_staff: false,
    is_superuser: false,
    is_agent: false,
    is_verified_agent: false,
  });

  // Location state (similar to MainProfile)
  const [currentRegion, setCurrentRegion] = useState("");
  const [currentDistrict, setCurrentDistrict] = useState("");

  // Fetch regions and districts (similar to MainProfile)
  const { data: regions, isLoading: regionsLoading } = useGetRegionsListQuery(
    {},
    {
      skip: !token || !isOpen,
      refetchOnMountOrArgChange: 86400, // Cache for 24 hours
    }
  );

  const { data: districts, isLoading: districtsLoading } =
    useGetDistrictsListQuery(currentRegion, {
      skip: !currentRegion || !token || !isOpen,
      refetchOnMountOrArgChange: 86400, // Cache for 24 hours
    });

  // Memoize the formatted data to prevent unnecessary re-renders
  const regionsList = useMemo(() => regions as RegionsList, [regions]);
  const districtsList = useMemo(() => districts as DistrictsList, [districts]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        phone_number: user.phone_number || "",
        user_type: user.user_type,
        user_role: user.user_role,
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
        is_agent: user.is_agent,
        is_verified_agent: user.is_verified_agent,
      });

      // Set location data
      setCurrentRegion(user.location?.region || "");
      setCurrentDistrict(user.location?.district || "");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Handle region change (similar to MainProfile)
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    setCurrentRegion(newRegion);
    setCurrentDistrict(""); // Reset district when region changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare updated data including location
    const updatedData: UpdateUserData = {
      ...formData,
      location: {
        ...user.location,
        region: currentRegion,
        district: currentDistrict,
      },
    };

    onSave(user, updatedData);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaEdit className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit User
                </h3>
                <p className="text-sm text-gray-600">ID: {user.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Basic Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type
                  </label>
                  <select
                    value={formData.user_type}
                    onChange={(e) =>
                      setFormData({ ...formData, user_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="regular">Regular</option>
                    <option value="premium">Premium</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Role
                  </label>
                  <select
                    value={formData.user_role}
                    onChange={(e) =>
                      setFormData({ ...formData, user_role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  Location
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    value={currentRegion}
                    onChange={handleRegionChange}
                    disabled={regionsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Select Region</option>
                    {regionsLoading ? (
                      <option disabled>Loading regions...</option>
                    ) : (
                      regionsList?.regions?.map((region, index) => (
                        <option key={`region-${index}`} value={region.region}>
                          {region.region}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <select
                    value={currentDistrict}
                    onChange={(e) => setCurrentDistrict(e.target.value)}
                    disabled={districtsLoading || !currentRegion}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="">Select District</option>
                    {districtsLoading ? (
                      <option disabled>Loading districts...</option>
                    ) : (
                      districtsList?.districts?.map((district, index) => (
                        <option
                          key={`district-${index}`}
                          value={district.district}
                        >
                          {district.district}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Current Location Display */}
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-1">Current Location</p>
                  <p className="text-sm text-gray-900">
                    {user.location?.region || "No region"},{" "}
                    {user.location?.district || "No district"}
                  </p>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Permissions
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Active Account
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_staff}
                      onChange={(e) =>
                        setFormData({ ...formData, is_staff: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Staff Member</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_superuser}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_superuser: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Super User</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_agent}
                      onChange={(e) =>
                        setFormData({ ...formData, is_agent: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Agent</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.is_verified_agent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_verified_agent: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={!formData.is_agent}
                    />
                    <span
                      className={`text-sm ${
                        !formData.is_agent ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      Verified Agent
                    </span>
                  </label>
                </div>

                {/* User Info Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    User Summary
                  </h5>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Last Login:</strong>{" "}
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : "Never"}
                    </p>
                    <p>
                      <strong>Agent:</strong>{" "}
                      {user.agent_info
                        ? `${user.agent_info.agency_name} (${user.agent_info.rating}⭐)`
                        : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// Action Buttons Component
const ActionButtons: React.FC<{
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}> = ({ user, onEdit, onDelete, onView }) => {
  return (
    <div className="flex items-center space-x-1">
      {/* View Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView(user);
        }}
        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
        title="View Details"
      >
        <FaEye className="w-4 h-4" />
      </button>

      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(user);
        }}
        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
        title="Edit User"
      >
        <FaEdit className="w-4 h-4" />
      </button>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(user);
        }}
        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
        title="Delete User"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  );
};

const TotalUsersList: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || "";
  const navigate = useNavigate();

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [updateUser] = useUpdateRegisteredUserMutation();
  const [deleteUser] = useDeleteRegisteredUserMutation();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  const {
    data: usersList,
    isLoading,
    error,
    refetch,
  } = useGetRegisteredUsersQuery({
    token,
    page: currentPage,
    pageSize,
    search: debouncedSearchTerm,
    userType: userTypeFilter,
    isActive: statusFilter,
    isStaff: roleFilter,
    region: regionFilter,
  });

  const typedUsersList = usersList as UsersResponse | undefined;

  // Modal handlers
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    navigate(`/admin/user/${user.id}`);
  };

  // Updated handleEditSave with location logic
  const handleEditSave = async (user: User, updatedData: UpdateUserData) => {
    setIsEditLoading(true);
    try {
      // Find the district ID if location is being updated
      let locationId = undefined;
      if (
        updatedData.location &&
        updatedData.location.district &&
        updatedData.location.region
      ) {
        // You might need to implement a way to get district ID by name
        // For now, we'll send the district name and let the backend handle it
        locationId = updatedData.location.id;
      }

      // Prepare the request data according to your API structure
      const requestData = {
        username: updatedData.username,
        phone_number: updatedData.phone_number,
        user_type: updatedData.user_type,
        is_active: updatedData.is_active,
        is_staff: updatedData.is_staff,
        is_superuser: updatedData.is_superuser,
        is_verified_agent: updatedData.is_verified_agent,
        // Add location_id if location is being updated
        ...(locationId && { location_id: locationId }),
        // Add password only if provided
        ...(updatedData.password && { password: updatedData.password }),
        // Add agent info if user is an agent
        ...(updatedData.is_agent &&
          updatedData.agent_info && {
            agent_agency_name: updatedData.agent_info.agency_name,
            agent_rating: updatedData.agent_info.rating,
            agent_total_sales: updatedData.agent_info.total_sales,
          }),
      };

      // Use RTK Query mutation
      const result = (await updateUser({
        token,
        id: user.id,
        data: requestData,
      }).unwrap()) as ApiResponse;

      if (result.success) {
        alert(`User ${user.username} updated successfully`);
        setEditModalOpen(false);
        setSelectedUser(null);
        // No need to call refetch() - RTK Query will auto-refetch due to invalidatesTags
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (error: unknown) {
      console.error(error);
      // Handle RTK Query error format
      const errorMessage = "Failed to update user";
      alert(`Failed to update user: ${errorMessage}`);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteConfirm = async (user: User) => {
    setIsDeleteLoading(true);
    try {
      // Use RTK Query mutation
      const result = (await deleteUser({
        token,
        id: user.id,
      }).unwrap()) as ApiResponse;

      if (result.success) {
        alert(result.message || `User ${user.username} deleted successfully`);
        setDeleteModalOpen(false);
        setSelectedUser(null);
        // No need to call refetch() - RTK Query will auto-refetch due to invalidatesTags
      } else {
        throw new Error(result.error || "Deletion failed");
      }
    } catch (error: unknown) {
      console.error("Failed to delete user:", error);

      let errorMessage = "Failed to delete user";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as Error).message);
      }

      alert(`Failed to delete user: ${errorMessage}`);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setDebouncedSearchTerm(searchTerm);
    refetch();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setUserTypeFilter("");
    setStatusFilter("");
    setRoleFilter("");
    setRegionFilter("");
    setCurrentPage(1);
    setDebouncedSearchTerm("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  const getRoleBadge = (user: User) => {
    const badges = {
      super_admin: {
        label: "Super Admin",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: FaUserShield,
      },
      staff: {
        label: "Staff",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: FaCog,
      },
      verified_agent: {
        label: "Verified Agent",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: FaUserCheck,
      },
      pending_agent: {
        label: "Pending Agent",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: FaClock,
      },
      regular_user: {
        label: "User",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: FaUser,
      },
    };

    const badge =
      badges[user.user_role as keyof typeof badges] || badges.regular_user;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderPagination = () => {
    if (!typedUsersList?.data.pagination) return null;

    const { current_page, total_pages, has_previous, has_next } =
      typedUsersList.data.pagination;

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t">
        <div className="flex items-center text-sm text-gray-500">
          <span>
            Showing {(current_page - 1) * pageSize + 1} to{" "}
            {Math.min(
              current_page * pageSize,
              typedUsersList.data.pagination.total_users
            )}{" "}
            of {typedUsersList.data.pagination.total_users} users
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(current_page - 1)}
              disabled={!has_previous}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
              let pageNum;
              if (total_pages <= 5) {
                pageNum = i + 1;
              } else if (current_page <= 3) {
                pageNum = i + 1;
              } else if (current_page >= total_pages - 2) {
                pageNum = total_pages - 4 + i;
              } else {
                pageNum = current_page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    current_page === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(current_page + 1)}
              disabled={!has_next}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">Error loading users</div>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!typedUsersList?.success) {
    return (
      <div className="text-center py-12 text-red-500">Failed to load users</div>
    );
  }

  const { users, statistics } = typedUsersList.data;

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header with statistics */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Total Users Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor all platform users
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.total_users}
                </div>
                <div className="text-xs text-gray-500">Total Users</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.active_users}
                </div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">
                  {statistics.staff_users}
                </div>
                <div className="text-xs text-gray-500">Staff</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.verified_agents}
                </div>
                <div className="text-xs text-gray-500">Agents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                value={userTypeFilter}
                onChange={(e) =>
                  handleFilterChange(setUserTypeFilter, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="regular">Regular</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleFilterChange(setStatusFilter, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) =>
                  handleFilterChange(setRoleFilter, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="true">Staff</option>
                <option value="false">Regular</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <input
                type="text"
                placeholder="Filter by region"
                value={regionFilter}
                onChange={(e) =>
                  handleFilterChange(setRegionFilter, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <FaFilter className="w-4 h-4 inline mr-2" />
              Search
            </button>

            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewUser(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profile_image_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profile_image_url}
                            alt={user.username}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FaPhone className="w-3 h-3 mr-1" />
                          {user.phone_number}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      {getRoleBadge(user)}
                      {getStatusBadge(user.is_active)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FaMapMarkerAlt className="w-3 h-3 mr-1 text-gray-400" />
                      <div>
                        <div>{user.location.region}</div>
                        <div className="text-xs text-gray-500">
                          {user.location.district}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.agent_info ? (
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900">
                          <FaBuilding className="w-3 h-3 mr-1 text-gray-400" />
                          {user.agent_info.agency_name}
                        </div>
                        <div className="flex items-center text-gray-500 text-xs">
                          <FaStar className="w-3 h-3 mr-1 text-yellow-400" />
                          {user.agent_info.rating} •{" "}
                          {user.agent_info.total_sales} sales
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Not an agent
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FaCalendarAlt className="w-3 h-3 mr-1 text-gray-400" />
                      {formatDate(user.created_at)}
                    </div>
                    {user.last_login && (
                      <div className="text-xs text-gray-500">
                        Last: {formatDate(user.last_login)}
                      </div>
                    )}
                  </td>

                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButtons
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                      onView={handleViewUser}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Edit Modal */}
      <EditModal
        user={selectedUser}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditSave}
        isLoading={isEditLoading}
      />

      {/* Delete Modal */}
      <DeleteModal
        user={selectedUser}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleteLoading}
      />
    </>
  );
};

export default TotalUsersList;
