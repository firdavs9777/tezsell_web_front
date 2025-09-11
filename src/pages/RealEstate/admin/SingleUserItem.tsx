import { RootState } from "@store/index";
import { useGetUserDetailQuery } from "@store/slices/users";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Crown,
  Star
} from 'lucide-react';

// Type definitions
interface Location {
  id: number;
  country: string;
  region: string;
  district: string;
}

interface ProfileImage {
  url: string | null;
  alt_text: string | null;
}

interface Permissions {
  is_agent: boolean;
  is_verified_agent: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  can_create_properties: boolean;
  can_manage_inquiries: boolean;
  can_access_admin: boolean;
  can_verify_agents: boolean;
  can_manage_users: boolean;
}

interface UserData {
  id: number;
  username: string;
  phone_number: string;
  user_type: 'regular' | 'premium' | 'agent';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  location: Location | null;
  profile_image: ProfileImage;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_agent: boolean;
  is_verified_agent: boolean;
  agent_info: any; // You can make this more specific based on your needs
  user_role: 'super_admin' | 'admin' | 'moderator' | 'user';
  permissions: Permissions;
}

interface UserDetailResponse {
  success: boolean;
  message: string;
  data: UserData;
}

// Type guard function
const isValidUserResponse = (data: any): data is UserDetailResponse => {
  return (
    data &&
    typeof data === 'object' &&
    data.success === true &&
    data.data &&
    typeof data.data.id === 'number' &&
    typeof data.data.username === 'string'
  );
};

const SingleUserItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  const { data, isLoading, error } = useGetUserDetailQuery(
    { token: token!, id: id! },
    { skip: !token || !id }
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUserTypeConfig = (userType: string) => {
    const configs = {
      regular: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: User,
        label: 'Regular User'
      },
      premium: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Star,
        label: 'Premium User'
      },
      agent: {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: Shield,
        label: 'Agent'
      }
    };
    return configs[userType as keyof typeof configs] || configs.regular;
  };

  const getRoleConfig = (role: string) => {
    const configs = {
      super_admin: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Crown,
        label: 'Super Admin'
      },
      admin: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Settings,
        label: 'Admin'
      },
      moderator: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        label: 'Moderator'
      },
      user: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: User,
        label: 'User'
      }
    };
    return configs[role as keyof typeof configs] || configs.user;
  };

  const formatPermissionKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/^(can|is)\s/, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading user details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <h2 className="text-xl font-semibold text-red-800">Error Loading User</h2>
          </div>
          <p className="text-red-600 mb-4">
            We encountered an error while loading the user details. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Invalid response state
  if (!isValidUserResponse(data)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <h2 className="text-xl font-semibold text-yellow-800">User Not Found</h2>
          </div>
          <p className="text-yellow-600">
            The requested user could not be found. Please check the user ID and try again.
          </p>
        </div>
      </div>
    );
  }

  const user = data.data;
  const userTypeConfig = getUserTypeConfig(user.user_type);
  const roleConfig = getRoleConfig(user.user_role);
  const UserTypeIcon = userTypeConfig.icon;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24 sm:h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-12 sm:-mt-16">
              {/* Profile Image */}
              <div className="relative mb-4 sm:mb-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                  {user.profile_image?.url ? (
                    <img
                      src={user.profile_image.url}
                      alt={user.profile_image.alt_text || user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl sm:text-4xl font-bold text-gray-500">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {user.is_active && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                      {user.username}
                    </h1>
                    <p className="text-gray-600 mt-1 flex items-center">
                      <span className="mr-2">📱</span>
                      {user.phone_number}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${userTypeConfig.color}`}>
                      <UserTypeIcon className="w-4 h-4 mr-1" />
                      {userTypeConfig.label}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${roleConfig.color}`}>
                      <RoleIcon className="w-4 h-4 mr-1" />
                      {roleConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${user.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                {user.is_active ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className={`text-lg font-semibold ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="text-lg font-semibold text-gray-900">#{user.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${user.is_staff ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Settings className={`h-6 w-6 ${user.is_staff ? 'text-purple-600' : 'text-gray-400'}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Staff</p>
                <p className={`text-lg font-semibold ${user.is_staff ? 'text-purple-600' : 'text-gray-400'}`}>
                  {user.is_staff ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${user.is_agent ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                <Shield className={`h-6 w-6 ${user.is_agent ? 'text-emerald-600' : 'text-gray-400'}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Agent</p>
                <p className={`text-lg font-semibold ${user.is_agent ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {user.is_agent ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              </div>
              {user.location ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Country</label>
                    <p className="text-gray-900 font-medium">{user.location.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Region</label>
                    <p className="text-gray-900 font-medium">{user.location.region}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">District</label>
                    <p className="text-gray-900 font-medium">{user.location.district}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No location information available</p>
              )}
            </div>

            {/* Permissions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(user.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">
                      {formatPermissionKey(key)}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Information */}
            {user.is_agent && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Agent Information</h2>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.is_verified_agent
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {user.is_verified_agent ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-1" />
                    )}
                    {user.is_verified_agent ? 'Verified Agent' : 'Pending Verification'}
                  </div>
                </div>
                {user.agent_info && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(user.agent_info, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Timeline Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-sm text-gray-600">{formatDate(user.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">{formatDate(user.updated_at)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${user.last_login ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Login</p>
                    <p className="text-sm text-gray-600">
                      {user.last_login ? formatDate(user.last_login) : 'Never logged in'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Edit User
                </button>
                <button className={`w-full py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                  user.is_active
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}>
                  {user.is_active ? 'Deactivate User' : 'Activate User'}
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  View Activity Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleUserItem;
