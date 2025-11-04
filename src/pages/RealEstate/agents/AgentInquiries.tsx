import { RootState } from "@store/index";
import {
  useGetAgentInquiriesQuery,
  useRespondToInquiryMutation,
} from "@store/slices/realEstate";
import { PropertyInquiry } from "@store/type";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Filter,
  Loader2,
  MessageCircle,
  Phone,
  Search,
  Send,
  User,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

const AgentInquiries: React.FC = () => {
  // State management
  const [filter, setFilter] = useState<"all" | "pending" | "responded">("all");
  const [selectedInquiryType, setSelectedInquiryType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null
  );
  const [responseMessage, setResponseMessage] = useState("");
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  // Redux state
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token || "";

  // API hooks
  const { data, isLoading, error, refetch } = useGetAgentInquiriesQuery({
    token,
  });
  const [respondToInquiry, { isLoading: isResponding }] =
    useRespondToInquiryMutation();

  // Toast helper
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4000
    );
  };

  const filteredInquiries = useMemo(() => {
    if (!data?.results) return [];

    return (data.results as PropertyInquiry[]).filter((inquiry) => {
      // Status filter
      if (filter === "pending" && inquiry.is_responded) return false;
      if (filter === "responded" && !inquiry.is_responded) return false;

      // Type filter
      if (selectedInquiryType && inquiry.inquiry_type !== selectedInquiryType)
        return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          inquiry.property_title.toLowerCase().includes(query) ||
          inquiry.user.username.toLowerCase().includes(query) ||
          inquiry.message.toLowerCase().includes(query) ||
          inquiry.property_id.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [data?.results, filter, selectedInquiryType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!data?.results) return { total: 0, pending: 0, responded: 0 };

    return {
      total: data.results.length,
      pending: data.results.filter((inquiry) => !inquiry.is_responded).length,
      responded: data.results.filter((inquiry) => inquiry.is_responded).length,
    };
  }, [data?.results]);

  // Handle response
  const handleRespond = (inquiryId: number) => {
    setSelectedInquiryId(inquiryId);
    setShowResponseModal(true);
    setResponseMessage("");
  };

  const submitResponse = async () => {
    if (!selectedInquiryId || !responseMessage.trim()) {
      showToast("Please enter a response message", "error");
      return;
    }

    try {
      await respondToInquiry({
        inquiryId: selectedInquiryId.toString(),
        response: responseMessage,
        token,
      }).unwrap();

      await refetch();
      setShowResponseModal(false);
      setSelectedInquiryId(null);
      setResponseMessage("");
      showToast("Response sent successfully!");
    } catch (error: unknown) {
      console.error("Error responding to inquiry:", error);
    }
  };

  const closeModal = () => {
    setShowResponseModal(false);
    setSelectedInquiryId(null);
    setResponseMessage("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Inquiries
          </h3>
          <p className="text-red-700 mb-4">
            Unable to load your inquiries. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg flex items-center ${
              toast.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className="ml-3 text-current hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Agent Inquiries
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and respond to property inquiries
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 mr-3 opacity-80" />
              <div>
                <p className="text-blue-100 text-sm">Total Inquiries</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Clock className="w-8 h-8 mr-3 opacity-80" />
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 mr-3 opacity-80" />
              <div>
                <p className="text-green-100 text-sm">Responded</p>
                <p className="text-3xl font-bold">{stats.responded}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Inquiries
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by property, user, or message..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as "all" | "pending" | "responded")
                  }
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Inquiries</option>
                  <option value="pending">Pending</option>
                  <option value="responded">Responded</option>
                </select>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inquiry Type
              </label>
              <select
                value={selectedInquiryType}
                onChange={(e) => setSelectedInquiryType(e.target.value)}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="viewing">Schedule Viewing</option>
                <option value="info">Request Information</option>
                <option value="offer">Make Offer</option>
                <option value="callback">Request Callback</option>
              </select>
            </div>
          </div>

          {/* Active filters display */}
          {(filter !== "all" || selectedInquiryType || searchQuery) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filter !== "all" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Status: {filter}
                  </span>
                )}
                {selectedInquiryType && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Type: {selectedInquiryType}
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Search: "{searchQuery}"
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilter("all");
                    setSelectedInquiryType("");
                    setSearchQuery("");
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-6">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No inquiries found
            </h3>
            <p className="text-gray-500">
              {searchQuery || filter !== "all" || selectedInquiryType
                ? "Try adjusting your filters to see more results."
                : "You haven't received any inquiries yet."}
            </p>
          </div>
        ) : (
          filteredInquiries.map((inquiry: PropertyInquiry) => {
            const { date, time } = formatDate(inquiry.created_at);

            return (
              <div
                key={inquiry.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${
                  inquiry.is_responded
                    ? "border-l-green-500"
                    : "border-l-yellow-500"
                } hover:shadow-md transition-shadow duration-200`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {inquiry.property_title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="w-4 h-4 mr-1" />
                        Property ID: {inquiry.property_id}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          inquiry.is_responded
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {inquiry.is_responded ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <Clock className="w-4 h-4 mr-1" />
                        )}
                        {inquiry.is_responded ? "Responded" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-start">
                      <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Contact
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {inquiry.user.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          {inquiry.user.phone_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MessageCircle className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Inquiry Type
                        </p>
                        <p className="text-sm text-gray-900">
                          {inquiry.inquiry_type_display}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Created
                        </p>
                        <p className="text-sm text-gray-900">{date}</p>
                        <p className="text-sm text-gray-600">{time}</p>
                      </div>
                    </div>

                    {inquiry.offered_price && (
                      <div className="flex items-start">
                        <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Offered Price
                          </p>
                          <p className="text-sm text-gray-900 font-semibold">
                            $
                            {parseFloat(inquiry.offered_price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Message
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {inquiry.message}
                      </p>
                    </div>
                  </div>

                  {/* Preferred Contact Time */}
                  {inquiry.preferred_contact_time && (
                    <div className="mb-6">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-gray-700">
                          Preferred Contact Time
                        </p>
                      </div>
                      <p className="text-sm text-gray-900 mt-1 ml-6">
                        {inquiry.preferred_contact_time}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    {!inquiry.is_responded ? (
                      <button
                        onClick={() => handleRespond(inquiry.id)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Respond to Inquiry
                      </button>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          Response sent
                        </span>
                        {inquiry.response_date && (
                          <span className="text-sm text-gray-500 ml-2">
                            on {formatDate(inquiry.response_date).date}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Respond to Inquiry
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Response Message
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Type your response to the client..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Be professional and helpful in your response
                  </p>
                  <p className="text-sm text-gray-400">
                    {responseMessage.length}/500
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitResponse}
                  disabled={isResponding || !responseMessage.trim()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResponding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Response
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

export default AgentInquiries;
