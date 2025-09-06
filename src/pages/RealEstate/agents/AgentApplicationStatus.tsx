import { RootState } from "@store/index";
import {
  useCheckAgentStatusQuery,
  useGetAgentApplicationStatusQuery,
} from "@store/slices/realEstate";
import {
  AlertCircle,
  Award,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  FileText,
  RefreshCw,
  Star,
  Target,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface AgentData {
  id: number;
  user: {
    id: number;
    username: string;
    phone_number: string;
    user_type: string;
  };
  agency_name: string;
  licence_number: string;
  is_verified: boolean;
  rating: string;
  total_sales: number;
  years_experience: number;
  specialization: string;
  created_at: string;
}

interface ProfileCompletion {
  percentage: number;
  completed_fields: number;
  total_fields: number;
  missing_fields: string[];
}

interface AgentApplicationStatusResponse {
  success: boolean;
  application_status: "not_applied" | "pending" | "approved" | "rejected";
  is_verified: boolean;
  profile_completion: ProfileCompletion;
  agent_data: AgentData;
  requirements?: string[];
}

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  description: string;
}

const AgentApplicationStatusPage = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const navigate = useNavigate();

  // Fetch agent application status
  const {
    data: applicationStatus,
    isLoading: applicationLoading,
    error: applicationError,
    refetch: refetchApplication,
  } = useGetAgentApplicationStatusQuery(
    { token: token || "" },
    {
      skip: !token,
    }
  );

  // Fetch basic agent status
  const { isLoading: statusLoading, refetch: refetchStatus } =
    useCheckAgentStatusQuery(
      { token: token || "" },
      {
        skip: !token,
      }
    );

  const isLoading = applicationLoading || statusLoading;

  const handleRefresh = () => {
    if (token) {
      refetchApplication();
      refetchStatus();
    }
  };
  const handleAgentRedirect = (type?: string): void => {
    if (type == "agent-profile") {
      navigate(`/agent/profile`);
    } else {
      navigate(`/agent/dashboard`);
    }
  };

  const getStatusConfig = (
    status: string,
    isVerified: boolean
  ): StatusConfig => {
    switch (status) {
      case "not_applied":
        return {
          icon: AlertCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200",
          title: "Not Applied",
          description: "You haven't submitted an agent application yet.",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200",
          title: "Application Pending",
          description:
            "Your application is under review. We'll notify you once it's processed.",
        };
      case "approved":
        return {
          icon: CheckCircle,
          color: isVerified ? "text-green-600" : "text-blue-600",
          bgColor: isVerified ? "bg-green-100" : "bg-blue-100",
          borderColor: isVerified ? "border-green-200" : "border-blue-200",
          title: isVerified ? "Verified Agent" : "Application Approved",
          description: isVerified
            ? "Congratulations! You are now a verified real estate agent."
            : "Your application has been approved and is being processed for verification.",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-100",
          borderColor: "border-red-200",
          title: "Application Rejected",
          description:
            "Unfortunately, your application was not approved. Please contact support for details.",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200",
          title: "Unknown Status",
          description: "Unable to determine application status.",
        };
    }
  };

  const getMissingFieldLabel = (field: string): string => {
    const fieldLabels: { [key: string]: string } = {
      agency_name: "Agency Name",
      licence_number: "License Number",
      years_experience: "Years of Experience",
      specialization: "Specialization",
      phone_number: "Phone Number",
      full_name: "Full Name",
    };
    return fieldLabels[field] || field.replace("_", " ").toUpperCase();
  };

  // Handle no token
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to view your agent application status.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (applicationError || !applicationStatus?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Status
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load your application status.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Type assertion with proper checking
  const typedApplicationStatus =
    applicationStatus as AgentApplicationStatusResponse;
  const statusConfig = getStatusConfig(
    typedApplicationStatus.application_status,
    typedApplicationStatus.is_verified
  );
  const StatusIcon = statusConfig.icon;
  const agentData = typedApplicationStatus.agent_data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Agent Application Status
          </h1>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Status Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Status Header */}
              <div
                className={`${statusConfig.bgColor} border-b-2 ${statusConfig.borderColor} px-8 py-6`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 ${statusConfig.bgColor} rounded-2xl flex items-center justify-center border-2 border-white shadow-lg`}
                  >
                    <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${statusConfig.color}`}>
                      {statusConfig.title}
                    </h2>
                    <p className={`${statusConfig.color} mt-1 opacity-80`}>
                      {statusConfig.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              {agentData && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Application Details
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Applied:{" "}
                        {new Date(agentData.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Applicant Details
                          </p>
                          <p className="font-semibold text-gray-900">
                            {agentData.user.username}
                          </p>
                          <p className="text-sm text-gray-600">
                            {agentData.user.phone_number}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {agentData.user.user_type} Account
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Building2 className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Agency
                          </p>
                          <p className="font-semibold text-gray-900">
                            {agentData.agency_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Award className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            License Number
                          </p>
                          <p className="font-semibold text-gray-900 font-mono">
                            {agentData.licence_number}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Experience
                          </p>
                          <p className="font-semibold text-gray-900">
                            {agentData.years_experience} years
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Target className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Specialization
                          </p>
                          <p className="font-semibold text-gray-900">
                            {agentData.specialization}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Star className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Current Performance
                          </p>
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {agentData.rating}/5.0
                              </p>
                              <p className="text-xs text-gray-500">Rating</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {agentData.total_sales}
                              </p>
                              <p className="text-xs text-gray-500">Sales</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleAgentRedirect("agent-profile")}
                      className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Update Profile</span>
                    </button>

                    {typedApplicationStatus.is_verified && (
                      <button
                        onClick={() => handleAgentRedirect("dashboard")}
                        className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Go to Dashboard</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion Card */}
            {typedApplicationStatus.profile_completion && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Completion
                </h3>

                {/* Progress Circle */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 10}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        10 *
                        (1 -
                          typedApplicationStatus.profile_completion.percentage /
                            100)
                      }`}
                      className="text-indigo-600"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">
                      {Math.round(
                        typedApplicationStatus.profile_completion.percentage
                      )}
                      %
                    </span>
                  </div>
                </div>

                <p className="text-center text-gray-600 mb-4">
                  {typedApplicationStatus.profile_completion.completed_fields}{" "}
                  of {typedApplicationStatus.profile_completion.total_fields}{" "}
                  fields completed
                </p>

                {/* Missing Fields */}
                {typedApplicationStatus.profile_completion.missing_fields
                  .length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Missing Information:
                    </h4>
                    <ul className="space-y-1">
                      {typedApplicationStatus.profile_completion.missing_fields.map(
                        (field: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2 text-sm text-red-600"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>{getMissingFieldLabel(field)}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Profile Complete!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Next Steps Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Next Steps
              </h3>

              {typedApplicationStatus.application_status === "pending" && (
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        typedApplicationStatus.profile_completion
                          ?.percentage === 100
                          ? "bg-green-500"
                          : "bg-indigo-600"
                      }`}
                    ></div>
                    <p>
                      Complete profile information{" "}
                      {typedApplicationStatus.profile_completion?.percentage ===
                        100 && "✓"}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <p>Wait for admin review (2-3 business days)</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <p>Receive verification confirmation</p>
                  </div>
                </div>
              )}

              {typedApplicationStatus.is_verified && (
                <div className="text-sm text-green-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">You're all set!</span>
                  </div>
                  <p>
                    You can now start listing properties and managing your real
                    estate business.
                  </p>
                </div>
              )}

              {typedApplicationStatus.application_status === "rejected" && (
                <div className="text-sm text-red-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Application Rejected</span>
                  </div>
                  <p>Please contact support for details and next steps.</p>
                </div>
              )}
            </div>

            {/* Application ID Card */}
            {agentData && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Application ID: #{agentData.id}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentApplicationStatusPage;
