import { RootState } from "@store/index";
import { useGetRegisteredUsersQuery } from "@store/slices/users";
import { User, UsersResponse } from "@store/type";
import React, { useEffect, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCog,
  FaEdit,
  FaEye,
  FaFilter,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaStar,
  FaTrash,
  FaUser,
  FaUserCheck,
  FaUserShield,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";





const TotalUsersList: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || "";

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
    const navigate = useNavigate();

  // Add debounced search state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1); // Reset to first page when searching
      }
    }, 500); // 500ms delay

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
    search: debouncedSearchTerm, // Use debounced search term
    userType: userTypeFilter,
    isActive: statusFilter,
    isStaff: roleFilter,
    region: regionFilter,
  });

  const typedUsersList = usersList as UsersResponse | undefined;

  const handleSearch = () => {
    setCurrentPage(1);
    setDebouncedSearchTerm(searchTerm); // Immediately apply search
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

  // Handle filter changes and reset to first page
  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value);
    setCurrentPage(1);
  };

   const redirectHandler = (id: number) => navigate(`/admin/user/${id}`);


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
              setCurrentPage(1); // Reset to first page when changing page size
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
              <tr key={user.id} className="hover:bg-gray-50" onClick={() => redirectHandler(user.id)}>
                <td className="px-6 py-4 whitespace-nowrap" >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.profile_image_url ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.profile_image_url}
                          alt={user.username}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <FaUser className="h-5 w-5 text-gray-600" />
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
                        {user.agent_info.rating} • {user.agent_info.total_sales}{" "}
                        sales
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not an agent</span>
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

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default TotalUsersList;
