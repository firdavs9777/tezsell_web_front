import { RootState } from "@store/index";
import { useBecomeAgentMutation } from "@store/slices/realEstate";
import { Award, Building2, Calendar, Check, Send, Target } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
export interface BecomeAgentRequest {
  agency_name: string;
  licence_number: string;
  years_experience: number;
  specialization: string;
  token?: string;
}

const BecomeAgentComp = () => {
  const [formData, setFormData] = useState<BecomeAgentRequest>({
    agency_name: "",
    licence_number: "",
    years_experience: 0,
    specialization: "",
    token: "",
  });
  const { t } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [becomeAgent] = useBecomeAgentMutation({});

  const specializations = [
    "Residential Sales",
    "Commercial Real Estate",
    "Property Management",
    "Real Estate Investment",
    "Luxury Properties",
    "Land Development",
    "Industrial Real Estate",
    "Retail Leasing",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "years_experience" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const token = userInfo?.token;
    if (!token) {
      toast.error(t("authentication_required"), { autoClose: 3000 });
      return;
    }

    try {
      // Replace with your actual API call
      const response = await becomeAgent({
        years_experience: formData.years_experience,
        agency_name: formData.agency_name,
        licence_number: formData.licence_number,
        specialization: formData.specialization,
        token: token,
      });

      if (response.data) {
        // Success! Navigate to status page
        toast.success("Application submitted successfully!", {
          autoClose: 2000,
        });
        // Navigate to agent status page - replace with your actual router
        // navigate("/agent/status");

        // For demo purposes, we'll show the success screen
        setIsSubmitted(true);
      } else {
        toast.error("Failed to submit application. Please try again.", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      "Submission error:", error;
      toast.error("An error occurred. Please try again.", { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in becoming an agent. We'll review your
            application and get back to you within 2-3 business days.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                // Navigate to agent status page
                alert(
                  "Redirecting to /agent/status - implement with your router"
                );
                // navigate('/agent/status');
              }}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Check Application Status
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-6">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Become an{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
              Agent
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our network of professional real estate agents and take your
            career to the next level
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Application Form</h2>
            <p className="text-indigo-100 mt-2">
              Fill in your professional details below
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Agency Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Building2 className="w-4 h-4 mr-2 text-indigo-600" />
                  Agency Name
                </label>
                <input
                  type="text"
                  name="agency_name"
                  value={formData.agency_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 hover:bg-white"
                  placeholder="Enter your agency name"
                />
              </div>

              {/* License Number */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Award className="w-4 h-4 mr-2 text-indigo-600" />
                  License Number
                </label>
                <input
                  type="text"
                  name="licence_number"
                  value={formData.licence_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 hover:bg-white"
                  placeholder="Enter your license number"
                />
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 hover:bg-white"
                  placeholder="Years in real estate"
                />
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Target className="w-4 h-4 mr-2 text-indigo-600" />
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 hover:bg-white"
                >
                  <option value="">Select your specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Token (Optional) */}
            <div className="mt-8 space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Referral Token{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="token"
                value={formData.token}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 hover:bg-white"
                placeholder="Enter referral token if you have one"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-10">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold py-4 px-8 rounded-xl hover:from-indigo-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Award,
              title: "Professional Growth",
              description:
                "Access to advanced training programs and certification opportunities",
            },
            {
              icon: Building2,
              title: "Network Access",
              description:
                "Connect with top-tier clients and industry professionals",
            },
            {
              icon: Target,
              title: "Marketing Support",
              description:
                "Comprehensive marketing tools and lead generation support",
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BecomeAgentComp;
