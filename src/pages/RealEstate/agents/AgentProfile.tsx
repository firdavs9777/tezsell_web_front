import { RootState } from "@store/index";
import {
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
} from "@store/slices/realEstate";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Edit3,
  Phone,
  Save,
  Star,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";

interface UserInfo {
  id: number;
  username: string;
  phone_number: string;
  user_type: string;
}

interface AgentProfileData {
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

interface UpdateFormData {
  agency_name: string;
  licence_number: string;
  years_experience: number;
  specialization: string;
}

const AgentProfile = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || "";

  const {
    data: profileResponse,
    isLoading,
    error,
  } = useGetAgentProfileQuery({ token });
  const [updateAgent, { isLoading: isUpdating }] =
    useUpdateAgentProfileMutation();

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState<UpdateFormData>({
    agency_name: "",
    licence_number: "",
    years_experience: 0,
    specialization: "",
  });

  const agentData: AgentProfileData | null = profileResponse?.data || null;

  // Initialize form data when modal opens
  const handleOpenModal = () => {
    if (agentData) {
      setFormData({
        agency_name: agentData.agency_name,
        licence_number: agentData.licence_number,
        years_experience: agentData.years_experience,
        specialization: agentData.specialization,
      });
    }
    setShowUpdateModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "years_experience" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    if (!token || !agentData) return;

    try {
      await updateAgent({
        profileData: formData,
        token,
      }).unwrap();
      setShowUpdateModal(false);
      // You might want to show a success toast here
    } catch (error) {
      "Failed to update profile:", error;
      // You might want to show an error toast here
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !agentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {agentData.user.username}
            </h1>
            <p className="text-gray-600">Real Estate Agent</p>
            <div className="flex items-center mt-1">
              {agentData.is_verified && (
                <div className="flex items-center text-green-600 mr-4">
                  <Award className="w-4 h-4 mr-1" />
                  <span className="text-sm">Verified Agent</span>
                </div>
              )}
              <div className="flex items-center text-yellow-600">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span className="text-sm">{agentData.rating}</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </button>
      </div>

      {/* Profile Information Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">
                {agentData.user.phone_number}
              </span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">
                User Type: {agentData.user.user_type}
              </span>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Professional Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">{agentData.agency_name}</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">
                License: {agentData.licence_number}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Performance
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">
                Total Sales: {agentData.total_sales}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">
                Experience: {agentData.years_experience} years
              </span>
            </div>
          </div>
        </div>

        {/* Specialization */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Specialization
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {agentData.specialization}
          </p>
        </div>
      </div>

      {/* Member Since */}
      <div className="mt-6 text-center text-gray-500">
        Member since{" "}
        {new Date(agentData.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Update Profile</h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agency Name
                </label>
                <input
                  type="text"
                  name="agency_name"
                  value={formData.agency_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  name="licence_number"
                  value={formData.licence_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <textarea
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentProfile;
