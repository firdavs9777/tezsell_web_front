import { RootState } from "@store/index";
import { useGetAgentDashboardQuery } from "@store/slices/realEstate";
import { Eye, Home, LucideIcon, MessageSquare, Phone, Star, TrendingUp, User } from 'lucide-react';
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// TypeScript interfaces
interface UserInfo {
  id: number;
  username: string;
  phone_number: string;
  user_type: string;
}

interface AgentInfo {
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

interface Statistics {
  total_properties: number;
  active_properties: number;
  sold_properties: number;
  inactive_properties: number;
  recent_properties: number;
  recent_inquiries: number;
  pending_inquiries: number;
  recent_views: number;
}

interface MonthlyPerformance {
  month: string;
  properties: number;
  inquiries: number;
}

interface DashboardData {
  success: boolean;
  agent_info: AgentInfo;
  statistics: Statistics;
  monthly_performance: MonthlyPerformance[];
}

const AgentDashboard = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || '';

  const { data, isLoading, error } = useGetAgentDashboardQuery({ token });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading dashboard</div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const { agent_info, statistics, monthly_performance } = data as DashboardData;

  // Format monthly data for charts (reverse to show chronologically)
  const chartData = [...monthly_performance].reverse().map(item => ({
    month: item.month.split(' ')[0], // Extract month name
    properties: item.properties,
    inquiries: item.inquiries
  }));

  // Property statistics for bar chart
  const propertyStats = [
    { name: 'Total', value: statistics.total_properties },
    { name: 'Active', value: statistics.active_properties },
    { name: 'Sold', value: statistics.sold_properties },
    { name: 'Inactive', value: statistics.inactive_properties }
  ];

  // Specialization data (split the specialization string)
  const specializationAreas = agent_info.specialization.split(', ');
  const specializationData = specializationAreas.map((area, index) => ({
    name: area,
    value: index === 0 ? 45 : index === 1 ? 35 : 20, // Sample distribution
    color: index === 0 ? '#8884d8' : index === 1 ? '#82ca9d' : '#ffc658'
  }));

  // Rating data for radial chart
  const ratingData = [
    {
      name: 'Rating',
      value: parseFloat(agent_info.rating),
      fill: '#8884d8',
      max: 5
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color = '#3b82f6' }: {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{agent_info.user.username}</h1>
                <p className="text-gray-600">{agent_info.agency_name}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    agent_info.is_verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {agent_info.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                  <span className="text-sm text-gray-500">License: {agent_info.licence_number}</span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Phone className="h-4 w-4 mr-1" />
                    {agent_info.user.phone_number}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-xl font-bold">{agent_info.rating}</span>
              </div>
              <p className="text-sm text-gray-600">{agent_info.years_experience} years experience</p>
              <p className="text-sm text-gray-600">{agent_info.total_sales} total sales</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <strong>Specialization:</strong> {agent_info.specialization}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Properties"
            value={statistics.total_properties}
            icon={Home}
            color="#3b82f6"
          />
          <StatCard
            title="Active Properties"
            value={statistics.active_properties}
            icon={TrendingUp}
            color="#10b981"
          />
          <StatCard
            title="Recent Inquiries"
            value={statistics.recent_inquiries}
            icon={MessageSquare}
            color="#f59e0b"
          />
          <StatCard
            title="Recent Views"
            value={statistics.recent_views}
            icon={Eye}
            color="#ef4444"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Performance Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="properties"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Properties"
                />
                <Line
                  type="monotone"
                  dataKey="inquiries"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Inquiries"
                />
              </LineChart>
            </ResponsiveContainer>
            {chartData.every(item => item.properties === 0 && item.inquiries === 0) && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                No activity data available yet. Start adding properties to see trends!
              </p>
            )}
          </div>

          {/* Property Statistics Bar Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Statistics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={propertyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Specialization Areas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialization Areas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={specializationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name?.split(' ')[0]} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {specializationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Rating Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Rating</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={ratingData}>
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff' }}
                  background

                  dataKey="value"
                  fill="#8884d8"
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-3xl font-bold text-gray-900">{agent_info.rating}/5.0</p>
              <p className="text-sm text-gray-600">Overall Rating</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{statistics.pending_inquiries}</p>
              <p className="text-sm text-gray-600">Pending Inquiries</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{agent_info.total_sales}</p>
              <p className="text-sm text-gray-600">Lifetime Sales</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{agent_info.years_experience}</p>
              <p className="text-sm text-gray-600">Years Experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
