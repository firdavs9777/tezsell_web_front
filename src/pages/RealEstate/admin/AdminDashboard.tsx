import { RootState } from "@store/index";
import { useGetAdminDashboardQuery } from "@store/slices/realEstate";
import {
  AlertCircle,
  Building,
  DollarSign,
  Eye,
  Home,
  MapPin,
  MessageCircle,
  Star,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';
import React from 'react';
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// TypeScript interfaces
interface UserInfo {
  id: number;
  username: string;
  phone_number: string;
  user_type: string;
}

interface Agent {
  id: number;
  user: UserInfo;
  agency_name: string;
  licence_number: string;
  is_verified: boolean;
  rating: string;
  total_sales: number;
  years_experience: number;
  specialization: string;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  property_type: string;
  property_type_display: string;
  listing_type: string;
  listing_type_display: string;
  price: string;
  price_per_sqm: string;
  currency: string;
  square_meters: number;
  bedrooms: number;
  bathrooms: number;
  district: string;
  city: string;
  region: string;
  views_count: number;
  created_at: string;
  latitude: string;
  longitude: string;
  address: string;
  is_featured: boolean;
  main_image: string | null;
  owner: UserInfo;
  agent: Agent | null;
  user_location: {
    id: number;
    country: string;
    region: string;
    district: string;
    display_name: string;
  };
}

interface DashboardData {
  overview: {
    total_properties: number;
    active_properties: number;
    sold_properties: number;
    featured_properties: number;
    total_agents: number;
    verified_agents: number;
    pending_agents: number;
    total_users: number;
    total_inquiries: number;
    pending_inquiries: number;
  };
  property_stats: {
    properties_for_sale: number;
    properties_for_rent: number;
    recent_properties_30d: number;
    avg_sale_price: number;
    avg_rent_price: number;
    avg_price_per_sqm: number;
    total_property_value: number;
    property_types: Array<{
      property_type: string;
      count: number;
      type_display: number;
    }>;
    by_city: Array<{
      city: string;
      count: number;
    }>;
    by_district: Array<{
      district: string;
      count: number;
    }>;
  };
  agent_stats: {
    verification_rate: number;
    new_agents_30d: number;
    avg_rating: number;
    top_agents: Agent[];
  };
  user_activity: {
    active_users_7d: number;
    new_users_30d: number;
    total_views: number;
    views_last_30d: number;
    total_saved: number;
  };
  inquiries: {
    recent_inquiries_7d: number;
    response_rate: number;
    by_type: Array<{
      inquiry_type: string;
      count: number;
    }>;
    popular_properties: Property[];
  };
  engagement: {
    most_viewed: Property[];
    most_saved: Property[];
    avg_views_per_property: number;
  };
  recent_activity: {
    properties: Property[];
    agents: Agent[];
  };
  system_health: {
    properties_without_images: number;
    properties_missing_location: number;
    agents_pending_verification: number;
  };
}


interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const AdminDashboard: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || '';
  const { data, isLoading, error, refetch } = useGetAdminDashboardQuery({ token });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const dashboardData: DashboardData = data.data;

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Stat Card Component
  const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      red: 'bg-red-500 text-red-600 bg-red-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50'
    };

    const colorArray = colorClasses[color].split(' ');

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colorArray[2]} mr-4`}>
            <Icon className={`w-6 h-6 ${colorArray[1]}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  // Property types data for pie chart
  const propertyTypesData = dashboardData.property_stats.property_types.map((item, index) => ({
    name: item.property_type.charAt(0).toUpperCase() + item.property_type.slice(1),
    value: item.count,
    fill: COLORS[index % COLORS.length]
  }));

  // Cities data for bar chart
  const citiesData = dashboardData.property_stats.by_city.slice(0, 5).map(item => ({
    name: item.city,
    properties: item.count
  }));

  // Districts data for bar chart
  const districtsData = dashboardData.property_stats.by_district.slice(0, 5).map(item => ({
    name: item.district.length > 15 ? item.district.substring(0, 15) + '...' : item.district,
    properties: item.count
  }));

  // Inquiry types data for pie chart
  const inquiryTypesData = dashboardData.inquiries.by_type.map((item, index) => ({
    name: item.inquiry_type.charAt(0).toUpperCase() + item.inquiry_type.slice(1),
    value: item.count,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time overview of your real estate platform
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(data.generated_at).toLocaleString()}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Properties"
            value={dashboardData.overview.total_properties}
            subtitle={`${dashboardData.overview.active_properties} active`}
            icon={Home}
            color="blue"
          />
          <StatCard
            title="Total Agents"
            value={dashboardData.overview.total_agents}
            subtitle={`${dashboardData.overview.verified_agents} verified`}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Total Users"
            value={dashboardData.overview.total_users}
            subtitle={`${dashboardData.user_activity.active_users_7d} active (7d)`}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Total Views"
            value={dashboardData.user_activity.total_views}
            subtitle={`${dashboardData.user_activity.views_last_30d} this month`}
            icon={Eye}
            color="yellow"
          />
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Avg Sale Price"
            value={`$${dashboardData.property_stats.avg_sale_price.toLocaleString()}`}
            subtitle="All active properties"
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Total Portfolio Value"
            value={`$${(dashboardData.property_stats.total_property_value / 1000000).toFixed(1)}M`}
            subtitle="Combined property value"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Avg Price per SqM"
            value={`$${dashboardData.property_stats.avg_price_per_sqm.toFixed(0)}`}
            subtitle="Market rate indicator"
            icon={Building}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Property Types Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Properties by City */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties by City</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={citiesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="properties" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Properties by District */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties by District</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="properties" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inquiry Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiry Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inquiryTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inquiryTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Agent Verification Rate"
            value={`${dashboardData.agent_stats.verification_rate}%`}
            subtitle="Quality control"
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Inquiry Response Rate"
            value={`${dashboardData.inquiries.response_rate}%`}
            subtitle="Customer service"
            icon={MessageCircle}
            color="blue"
          />
          <StatCard
            title="Avg Views per Property"
            value={dashboardData.engagement.avg_views_per_property}
            subtitle="Property popularity"
            icon={Eye}
            color="yellow"
          />
          <StatCard
            title="Featured Properties"
            value={dashboardData.overview.featured_properties}
            subtitle="Premium listings"
            icon={Star}
            color="purple"
          />
        </div>

        {/* Top Properties Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Viewed Properties */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Properties</h3>
            <div className="space-y-4">
              {dashboardData.engagement.most_viewed.slice(0, 5).map((property, index) => (
                <div key={property.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {property.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {property.city} • {property.views_count} views
                    </p>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    ${parseInt(property.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Agents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
            <div className="space-y-4">
              {dashboardData.agent_stats.top_agents.slice(0, 5).map((agent, index) => (
                <div key={agent.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {agent.user.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {agent.agency_name} • {agent.total_sales} sales
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {parseFloat(agent.rating).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-900">Properties without images</p>
                <p className="text-lg font-bold text-red-600">
                  {dashboardData.system_health.properties_without_images}
                </p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <MapPin className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Missing location data</p>
                <p className="text-lg font-bold text-yellow-600">
                  {dashboardData.system_health.properties_missing_location}
                </p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">Pending agent verification</p>
                <p className="text-lg font-bold text-blue-600">
                  {dashboardData.system_health.agents_pending_verification}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
